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
