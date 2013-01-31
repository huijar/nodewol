window.Device = Backbone.Model.extend({
    urlRoot: "/api/devices",
});

var DeviceCollection = Backbone.Collection.extend({
    model: Device,
    url:"/api/devices"
});
