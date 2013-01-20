window.AlarmView = Backbone.View.extend({
    initialize: function() {
        this.model.bind('destroy', this.remove, this);
    },

    events: {
        'click button': 'removeModel'
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
