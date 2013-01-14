/*
 * Configurable options
 */

var port = 1337                 // The port to listen to
var subnet = false   // The subnet to scan for macs, false if you don't want to scan
var exclude_macs = ['00:1a:9f:90:86:6a']

// OTA TÄÄ POIS
// nbtscan result for 192.168.2.10: 192.168.2.10,AFFOGATO       ,<server>,<unknown>,00:1a:9f:90:86:6a

/*
 * Module dependencies
 */

var express = require('express')
var stylus = require('stylus')
var nib = require('nib')
var arp = require('arp')
var pcap = require('pcap')
var dns = require('dns')
var _ = require("underscore")
var sys = require('util')
var os = require('os')
var exec = require('child_process').exec
var db = require('dirty')('device.db')
var child
var nbtscan_available

/*
 * Setting up the database
 */
db.on('load', function() {
    console.log("Database is up and running.")

    /*
     * Determine whether nbtscan is available for name resolution
     */
    nbtscan_available = false

    child = exec("which nbtscan", function(error, stdout, stderr) {
        if (error == null) {
            nbtscan_available = true
            console.log("nbtscan is available")
            updatenames()
            nbtscan_full()
        } else {
            console.log("nbtscan is *not* available")
        }
    })
})

db.on('drain', function() {
    console.log("All records have been saved.")
})

// A simple query function for the dirty db

db.q = function(field, s) {
    var ret = false
    this.forEach(function(key, value) {
        if (value[field] == s)
        {
            ret = key
            return false
        }
    })
    return ret
}

// A simple update function for the dirty db

db.u = function(key, field, val) {
    var dev = this.get(key)
    dev[field] = val
    this.set(key, dev)
}

db.has = function(key) {
    return this.get(key) !== undefined
}

/*
 * Figuring out the server's own IPs
 */

console.log("Own IPs: ")

var ownips = _.map(os.networkInterfaces(), function(element) { return _.first(_.pluck(element, "address")) } )

_.each(ownips, function(val) {
    console.log(val);
});

/*
 * Jade and Stylus init
 */

var app = express()
app.use(express.bodyParser())

function compile(str, path)
{
    return stylus(str).set('filename', path).use(nib())
}

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.logger('dev'))
app.use(stylus.middleware(
    {
        src: __dirname + '/public',
        compile: compile
    }
))
app.use(express.static(__dirname + '/public'))

/*
 * Device list management
 */

updatename = function(ip, name, override) {
    override = override || false
    var dev = db.q("ip", ip)
    var currname = db.get(dev).name
    if ( currname == "" || override )
        db.u(dev, "name", name)
}

nbtscan = function(ip) {
    if (!nbtscan_available) return ""

    var child = exec("nbtscan -q -s , "+ip, function(error,stdout,stderr) {
        if (error == null)
        {
            var sout = stdout.toString()
            console.log("nbtscan result for "+ip+": "+sout)
            if (sout.length)
            {
                var output = sout.split(',');
                updatename(ip,output[1].replace(/[ ]*$/,''))
            }
        } else {
            console.log(stdout)
            console.log(stderr)
        }
    })

    return ""
}

parse_nbtscan = function(line) {
    var cols = line.split(',')
    var ip = cols[0]
    var name = cols[1]
    var mac = cols[4]

    return { ip: ip, name: name, id: mac, type: "desktop" }
}

add_dev = function(dev) {
    if (!_.contains(ownips, dev.ip) && !db.has(dev.id) && dev.ip.length > 0 && dev.id.length > 0 && !_.contains(exclude_macs, dev.id))
    {
        db.set(dev.id, dev)
        console.log("Pushed " + dev.id)
    }
}

nbtscan_full = function() {
    if (subnet == false) return
    console.log("Issuing a full nbtscan of "+subnet)
    var child = exec("nbtscan -s , -r "+subnet, function(error,stdout,stderr) {
        if (error == null)
        {
            var sout = stdout.toString().split('\n')
            _.each(sout, function(elem) {
                add_dev(parse_nbtscan(elem))
            })
        }
    })
}

updatenames = function(all) {
    all = typeof all !== 'undefined' ? all : false;
    db.forEach(function(key, val) {
        if (all || val.name == "" || val.name == undefined)
        {
            console.log("Updating name for " + val.ip)
            dns.reverse(val.ip, function(err, domains) {
                val.name = err ? nbtscan(val.ip) : _.first(domains)
            })
        }
    })
}

updatedevlist = function(packet) {
    var smac = packet.link.shost
    var sip = packet.link.ip.saddr
    if (_.contains(ownips, sip) == false && !db.has(smac) && !_.contains(exclude_macs, smac))
    {
        var dev = { name: sip, id: smac, ip: sip, type: "tower" }
        add_dev(dev)
        console.log("Pushed " + smac)
        updatenames()
    }
}

setInterval(updatenames, 1800000);

/*
 * PCAP listener
 */

var pcap_session = pcap.createSession("", "tcp")

console.log("Listening on " + pcap_session.device_name);

pcap_session.on('packet', function(raw) {
    var packet = pcap.decode.packet(raw)
    if (!_.contains(exclude_macs, packet.smac))
        updatedevlist(packet)
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
    res.end(updatenames())
})

app.get('/api/devices', function(req, res) {
    var ret = []
    db.forEach(function(key, value) {
        ret.push(value)
    })
    res.json(ret)
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
    db.set(req.params.id, req.body);
    res.send(200);
});

app.listen(port);
