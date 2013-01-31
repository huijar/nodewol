// Calculate the time until the alarm

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

    // In a change event (that is, when the API returns a unix
    // timestamp delta for the alarm) show the time

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

window.AlarmListView = Backbone.View.extend({
    initialize: function() {
        this.model.bind("reset", this.render, this);
        this.model.bind("add", this.addOne, this);
        this.model.bind("remove", this.render, this);
    },

    addOne: function(alarm) {
        if ( this.model.models.length == 1 )
            this.$el.html('');

        var added = new AlarmView({model:alarm}).render().el;
        $(added).hide();
        this.$el.append(added);
        $(added).fadeIn();
    },

    render: function() {
        this.$el.html('');
        if ( this.model.models.length > 0 )
            _.each(this.model.models, this.addOne, this);
        else
            this.$el.html('No alarms set.');
        return this;
    },
});
