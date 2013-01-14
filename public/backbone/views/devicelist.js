window.DeviceListView = Backbone.View.extend({
    initialize: function() {
        $(this.el).addClass("accordion");
        this.model.bind("reset", this.render, this);
        this.model.bind("add", this.addOne, this);
        this.model.bind("remove", this.render, this);
    },

    addOne: function(device) {
        $(this.el).append(new DeviceView({model:device}).render().el);
    },

    render: function() {
        $(this.el).html('');
        _.each(this.model.models, this.addOne, this);
        return this;
    }
});
