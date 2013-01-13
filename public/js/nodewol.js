var clock;
var clockv;
$(document).ready(function() {
    clock = new Clock();
    clockv = new ClockView({ model: clock, el: $("div#clock") })
});
