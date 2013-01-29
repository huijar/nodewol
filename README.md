Nodewol
=======

Nodewol is a simple wake-on-lan tool written with node, underscore, backbone, Raphaël, jQuery and Twitter Bootstrap. It is intended for the low-power Raspberry Pi.

![Screenshot](https://raw.github.com/huijar/nodewol/master/public/img/nodewol_scrot.png)

At the moment the (web-based) UI is optimized for desktop/laptop use. A fully responsive mobile UI is in progress.

## Installation

Required packages are node and npm. It is recommended to install nbtscan as well for NetBIOS name resolution and subnet scanning. Nodewol supports reverse DNS as well.

On a Debian box (such as the Raspbian edition), the recommended installation procedure is:

<pre>
sudo apt-get install node npm nbtscan
npm install nodewol
</pre>

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

## License (MIT)

Copyright (c) 2013 Jari Huilla

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
