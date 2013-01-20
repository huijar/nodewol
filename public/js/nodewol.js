var clock;
var clockv;
var deviceList;
var currdev;

strip = function(string) {
    return string.replace(/:/g,"");
}

$(document).ready(function() {
    clock = new Clock();
    clockv = new ClockView({ model: clock, el: $("div#clock") });
});

/*
var AppRouter = Backbone.Router.extend({
    routes: {
        "": "list"
    },

    initialize: function() {
        //this.deviceListView = new DeviceListView({ el: $("#devlist") });
        //this.deviceListView.render();
    },

    list: function() {
        var deviceList = new DeviceCollection();
        deviceList.fetch({success: function() {
            $("#devlist").html(new DeviceListView({ model: deviceList}).el);
        }});
    }
});
*/

utils.loadTemplate(['DeviceView'], function() {
    $.get('/api/devices/this', function(data) {
        currdev = data;
        window.deviceList = new DeviceCollection();
        deviceList.fetch({success: function() {
            new DeviceListView({ model: deviceList, el: $("#devlist") }).render();
        }});
        setInterval(function() {
            window.deviceList.fetch({update: true});
        }, 10000);

        $("#add-alarm").on("click", function() {
            window.alarmList.create({ "device": deviceList.selected.toJSON(), "time": clock.toJSON() });
        });
    }, "json");
});
utils.loadTemplate(['AlarmView'], function() {
    window.alarmList = new AlarmCollection();
    alarmList.fetch({ success: function() {
        new AlarmListView({ model: alarmList, el: $("#alarm-container")}).render();
    }});
    setInterval(function() {
        window.alarmList.fetch({update: true});
    }, 10000);
});
