/*
 * Configurable options
 */

var config = {};

// The port to listen to
config.port = 80;

// The subnet you want to examine (in CIDR notation ONLY)
config.subnet = "192.168.2.0/24";

// True if you want to disable full nbtscans
config.disable_full_nbtscan = false;

// MAC addresses to be excluded
config.exclude_macs = []; // Example: ['00:00:de:ad:be:ef'];

module.exports = config;
