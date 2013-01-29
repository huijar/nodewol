calcTime = function(delta) {
    var h_mult = 3600*1000;
    var m_mult = 60*1000;

    var h = Math.floor(delta/h_mult);
    var m = Math.floor((delta - h*h_mult)/m_mult);

    return h + " hours and " + m + " minutes";
}

window.AlarmView = Backbone.View.extend({
    initialize: function() {
        this.model.bind('destroy', this.remove, this);
        this.model.bind('change:delta', this.showTime, this);
    },

    events: {
        'click button': 'removeModel'
    },

    showTime: function(model, delta) {
        window.customAlert("Alarm in <strong>"+calcTime(delta)+"</strong>.");
    },
    
    removeModel: function() {
        this.model.destroy();
    },

    render: function() {
        var templ = this.model.toJSON();
        this.$el.html(this.template(templ));
        return this;
    },
});
