Nodewol
=======

Nodewol is a simple wake-on-lan tool written with node, underscore, backbone, Raphaël, jQuery and Twitter Bootstrap. It is intended for the low-power Raspberry Pi.

![Screenshot](https://raw.github.com/huijar/nodewol/master/public/img/nodewol_scrot.png)

At the moment the (web-based) UI is optimized for desktop/laptop use. A fully responsive mobile UI is in progress. And yes, the clock widget is a shameless ripoff from the exquisite Nokia N9.

## Installation

Required packages are nodejs, npm, g++ and libpcap-dev (the latter two for dependencies). It is recommended to install nbtscan as well for NetBIOS name resolution and subnet scanning. Nodewol supports reverse DNS as well.

On Debian Raspbian "wheezy", the recommended installation procedure is:

<pre>
sudo apt-get install nodejs npm nbtscan g++ libpcap-dev
npm install nodewol
</pre>

On other Debian installations you may have to edit your /etc/apt/sources.list. Instructions for that [here](http://ypcs.fi/howto/2012/10/09/nodejs-debian/). On other distributions you should find a way to install node, npm and nbtscan and the rest can be done with npm.

## Configuration

Check config.js.

## Usage

Currently Nodewol requires root privileges because of the packet capturing feature (which automatically adds devices to the list). In the Nodewol directory, do a "sudo node app.js".

## Known issues

* The packet capturing feature slows networking down somewhat.
* Multiple devices may appear to have the same IP in a network with many dynamic leases.
* The clock widget may behave a little odd occasionally.
* If the browser window is too narrow the panels overlap.
* Only IPv4 networks are supported.
* There's no way to add a device manually.
* The code is poorly documented.

## License (MIT)

Copyright (c) 2013 Jari Huilla

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
