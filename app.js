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
var child
var ownips = _.map(os.networkInterfaces(), function(element) { return _.first(_.pluck(element, "address")) } )

console.log("Own IP:s: ")

_.each(ownips, function(val) {
    console.log(val);
});

/*
 * Determine whether nbtscan is available for name resolution
 */
var nbtscan_available = false

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



/*
 * Jade and Stylus init
 */

var app = express()

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

var devlist = []

//devlist.push({ mac: 'e0:cb:4e:ba:b3:0e', ip: 'bleh', name: 'blah' })

updatename = function(ip, name) {
    _.each(devlist, function(element) {
        if (element.ip == ip)
            element.name = name
    }, devlist)
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

    return { ip: ip, name: name, mac: mac }
}

add_dev = function(dev) {
    if (!_.contains(ownips, dev.ip) && !_.contains(_.pluck(devlist, 'mac'), dev.mac) && dev.ip.length > 0 && dev.mac.length > 0 && !_.contains(exclude_macs, dev.mac))
    {
        devlist.push(dev)
        console.log("Pushed " + dev.mac)
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
    _.each(devlist, function(element) {
        if (all || this.name == "" || this.name == undefined)
        {
            console.log("Updating name for " + element.ip)
            dns.reverse(element.ip, function(err, domains) {
                this.name = err ? nbtscan(element.ip) : _.first(domains)
            })
        }
    }, devlist)
}

updatedevlist = function(packet) {
    var smac = packet.link.shost
    var sip = packet.link.ip.saddr
    if (_.contains(ownips, sip) == false && _.contains(_.pluck(devlist, 'mac'), smac) == false && !_.contains(exclude_macs, smac))
    {
        devlist.push(
            { 
                mac: smac,
                ip: sip,
                name: ""
            }
        )
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

app.get('/', function(req, res) {
    res.render('index',
        { title: 'Home' }
    )
})

app.get('/ip', function(req, res) {
    var ip = req.connection.remoteAddress 
    arp.getMAC(ip, function(err, mac){
        var macaddr = err ? "" : mac
        res.render('ip',
            {
                title: 'IP',
                address: ip,
                mac: macaddr
            }
        )
    })
})

app.get('/list', function(req, res) {
    res.render('list', { title: 'List', list: devlist })
})

app.get('/updatenames', function(req, res) {
    res.end(updatenames())
})

app.listen(port)
