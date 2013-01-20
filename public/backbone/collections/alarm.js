var AlarmCollection = Backbone.Collection.extend({
    model: Alarm,
    url:"/api/alarms",
});
