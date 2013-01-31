window.Alarm = Backbone.Model.extend({
    urlRoot: "/api/alarms",
});

var AlarmCollection = Backbone.Collection.extend({
    model: Alarm,
    url:"/api/alarms",
});
