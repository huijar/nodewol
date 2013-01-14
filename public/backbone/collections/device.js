var DeviceCollection = Backbone.Collection.extend({
    model: Device,
    url:"/api/devices"
});
