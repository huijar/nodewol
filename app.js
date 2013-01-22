/*
 * Configurable options
 */

var port = 1337;                 // The port to listen to
var subnet = "192.168.2.0/24";   // The subnet you want to examine
var disable_full_nbtscan = true; // True if you want to disable
var exclude_macs = ['00:1a:9f:90:86:6a'];

/*
 * Module dependencies
 */

var express = require('express');
var stylus = require('stylus');
var nib = require('nib');
var arp = require('arp');
var pcap = require('pcap');
var dns = require('dns');
var _ = require("underscore");
var sys = require('util');
var os = require('os');
var exec = require('child_process').exec;
var db = require('dirty')('device.db');
var wol = require('wake_on_lan');
var child;
var nbtscan_available;
var alarms = [];
var alarmIndex = 0;

/*
 * Setting up the database
 */
db.on('load', function() {
    console.log("Database is up and running.");

    /*
     * Determine whether nbtscan is available for name resolution
     */
    nbtscan_available = false;

    child = exec("which nbtscan", function(error, stdout, stderr) {
        if (error == null) {
            nbtscan_available = true;
            console.log("nbtscan is available");
            updatenames();
            nbtscan_full();
        } else {
            console.log("nbtscan is *not* available");
        }
    })
})

db.on('drain', function() {
    console.log("All records have been saved.");
})

// A simple query function for the dirty db

db.q = function(field, s, cb) {
    var ret = false;
    this.forEach(function(key, value) {
        if (value[field] == s)
        {
            ret = key;
            if (cb) {
                cb(ret);
            }
            return false;
        }
    });
    if (!ret && cb) {
        cb(ret);
    }
    return ret;
}

// A simple update function for the dirty db

db.u = function(key, field, val) {
    var dev = this.get(key);
    dev[field] = val;
    this.set(key, dev);
}

db.has = function(key) {
    return this.get(key) !== undefined;
}

/*
 * Figuring out the server's own IPs
 */

console.log("Own IPs: ");

var discard_ips = _.map(os.networkInterfaces(), function(element) { return _.first(_.pluck(element, "address")); } );

_.each(discard_ips, function(val) {
    console.log(val);
});

/*
 * Jade and Stylus init
 */

var app = express();
app.use(express.bodyParser());

function compile(str, path)
{
    return stylus(str).set('filename', path).use(nib());
}

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(stylus.middleware(
    {
        src: __dirname + '/public',
        compile: compile
    }
));
app.use(express.static(__dirname + '/public'));

/*
 * Device list management
 */

updatename = function(ip, name, override) {
    override = override || false;
    var dev = db.q("ip", ip);
    var currname = db.get(dev).name;
    if ( currname == "" || override )
        db.u(dev, "name", name);
}

nbtscan = function(ip) {
    if (!nbtscan_available) return "";

    var child = exec("nbtscan -q -s , "+ip, function(error,stdout,stderr) {
        if (error == null)
        {
            var sout = stdout.toString();
            console.log("nbtscan result for "+ip+": "+sout);
            if (sout.length)
            {
                var output = sout.split(',');
                updatename(ip,output[1].replace(/[ ]*$/,''));
            }
        } else {
            console.log(stdout);
            console.log(stderr);
        }
    })

    return "";
}

parse_nbtscan = function(line) {
    var cols = line.split(',');
    var ip = cols[0];
    var name = cols[1];
    var mac = cols[4];

    return { ip: ip, name: name, id: mac, type: "desktop" };
}

add_dev = function(dev) {
    if (!_.contains(discard_ips, dev.ip) && !db.has(dev.id) && dev.ip.length > 0 && dev.id.length > 0 && !_.contains(exclude_macs, dev.id))
    {
        db.set(dev.id, dev);
        console.log("Pushed " + dev.id);
    }
}

nbtscan_full = function() {
    if (disable_full_nbtscan) return
    console.log("Issuing a full nbtscan of "+subnet);
    var child = exec("nbtscan -s , -r "+subnet,
        function(error,stdout,stderr) {
            if (error == null)
            {
                var sout = stdout.toString().split('\n');
                _.each(sout, function(elem) {
                    add_dev(parse_nbtscan(elem));
                })
            }
        }
    );
}

/*
 * PCAP shouldn't try to add devices from another networks
 * anyway, but just to be sure let's double-check.
 */

in_subnet = function(ip) {
    var sub = subnet.split('/');
    var netip = sub[0].split('.');
    var testip = ip.split('.');

    var netip_bin = ( parseInt(netip[0]) << 24 )
        | ( parseInt(netip[1]) << 16 )
        | ( parseInt(netip[2]) << 8 )
        | ( parseInt(netip[3]) << 0 );
    var testip_bin = ( parseInt(testip[0]) << 24 )
        | ( parseInt(testip[1]) << 16 )
        | ( parseInt(testip[2]) << 8 )
        | ( parseInt(testip[3]) << 0 );

    var mask = 0;
    for (var i = 31 - sub[1]; i <= 31; i++)
    {
        mask |= 1 << i;
    }

    if ( ( netip_bin & mask ) == ( testip_bin & mask ) )
    {
        return true;
    }
    else
    {
        console.log("Discarding " + ip + ", not in specified subnet.");
        discard_ips.push(ip);
        return false;
    }
}

updatenames = function(all) {
    all = typeof all !== 'undefined' ? all : false;
    db.forEach(function(key, val) {
        if (all || val.name == "" || val.name == undefined)
        {
            try {
                console.log("Updating name for " + val.ip);
                dns.reverse(val.ip, function(err, domains) {
                    val.name = err ? nbtscan(val.ip) : _.first(domains);
                })
            } catch (err)
            {
                console.log("Skipping, '" + val.ip + "' not a valid IP.");
            }
        }
    })
}

updatedevlist = function(packet) {
    var smac = packet.link.shost;
    var sip = packet.link.ip.saddr;
    var currdev = db.get(smac);
    if (_.contains(discard_ips, sip) == false && in_subnet(sip) && currdev == undefined && !_.contains(exclude_macs, smac))
    {
        var dev = { name: sip, id: smac, ip: sip, type: "tower" };
        add_dev(dev);
        console.log("Pushed " + smac);
        updatenames();
    }
    else if (currdev != undefined && sip != currdev.ip)
    {
        db.q("ip", sip, function(olddev) {
            if ( currdev.name == currdev.ip )
                db.u(currdev.id, "name", sip);
            db.u(currdev.id, "ip", sip);
            if ( olddev && olddev != currdev.id) {
                // TODO: Update the olddev name as well if needed
                db.u(olddev, "ip", "-");
            }
        });
    }
}

setInterval(updatenames, 1800000);

/*
 * PCAP listener
 */

//var pcap_session = pcap.createSession("", "tcp")
var pcap_session = pcap.createSession("", "src net "+subnet+" and tcp" );

console.log("Listening on " + pcap_session.device_name);

pcap_session.on('packet', function(raw) {
    var packet = pcap.decode.packet(raw);
    if (!_.contains(exclude_macs, packet.smac))
        updatedevlist(packet);
})

/*
 * Routes
 */

/*
app.get('/', function(req, res) {
    res.render('index',
        { title: 'Home' }
    )
})
*/

app.get('/', function(req, res) {
    res.render('list');
})

app.get('/updatenames', function(req, res) {
    res.end(updatenames());
})

app.get('/api/devices', function(req, res) {
    var ret = [];
    db.forEach(function(key, value) {
        ret.push(value);
    });
    res.json(ret);
})

app.get('/api/devices/this', function(req, res) {
    var ip = req.connection.remoteAddress;
    var dev = db.q("ip", ip);
    if ( dev !== undefined )
    {
        res.json(db.get(dev));
    }
    else
    {
        var ret = null;
        arp.getMAC(ip, function(err, mac){
            if (err) 
                return null;
            ret = db.get(mac);
            res.json(ret);
        });
    }
});

app.get('/api/devices/:id', function(req, res) {
    res.json(db.get(req.params.id));
});

app.put('/api/devices/:id', function(req, res) {
    req.body.name = req.body.name.replace(/<(?:.|\n)*?>/gm, '');
    db.set(req.params.id, req.body);
    res.send(200);
});

app.put('/api/alarms/:id', function(req, res) {
    console.log(req.params);
    res.send(201);
    return;
});

app.get('/api/alarms', function(req, res) {
    var ret = [];
    _.each(alarms, function(element) {
        ret.push(element.alarm);
    });
    res.json(ret);
});

app.delete('/api/alarms/:id', function(req, res) {
    console.log("Canceling timeout #" + req.params.id);
    clearTimeout(alarms[req.params.id].handle);
    delete alarms[req.params.id];
    res.send(204);
});

app.post('/api/alarms', function(req, res) {
    var currtime = new Date();
    var altime = new Date(currtime);
    altime.setSeconds(0);
    altime.setHours(req.body.time.h);
    altime.setMinutes(req.body.time.m);

    var delta = altime - currtime;

    // If the time has already passed, add 24 hours to it
    if ( delta < 0 )
    {
        delta += 24*60*60*1000;
    }

    var next = alarmIndex++;

    var new_alarm = setTimeout(function () {
        console.log("Trying to wake up " + req.body.device.id + "...");
        wol.wake(req.body.device.id);
        delete alarms[next];
    }, delta);
    alarms[next] = { alarm: req.body, handle: new_alarm };
    req.body.id = next;
    req.body.delta = delta;
    res.status(201).json(req.body);
});

app.listen(port);
