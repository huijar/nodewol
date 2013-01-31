window.DeviceView = Backbone.View.extend({
    initialize: function() {
        $(this.el).addClass("accordion-group");
        this.model.bind('change', this.update, this);
        this.model.bind('destroy', this.remove, this);
    },

    events: {
        'show .accordion-body': 'selectThis',
        'click .btn.details': 'toggleDetails',
        'click a.edit': 'edit',
        'keydown input': 'editKeyPress',
        'focusout input': 'cancelEdit',
        'click a.tower': 'typeTower',
        'click a.laptop': 'typeLaptop',
        'click a.desktop': 'typeDesktop',
    },

    selectThis: function() {
        deviceList.selected = this.model;
    },

    toggleDetails: function() {
        if ( $(this.el).find("table").css("display") != "none" )
            $(this.el).find(".btn.details").html("Show details");
        else
            $(this.el).find(".btn.details").html("Hide details");

        $(this.el).find("table").fadeToggle();
    },

    edit: function() {
        this.$el.addClass("editing");
        this.$input.focus();
        this.$input.select();
    },

    cancelEdit: function() {
        this.$el.removeClass("editing");
        this.$input.attr('value', this.$editlink.html());
    },

    editKeyPress: function(e) {
        if ( e.which == 27 ) // Escape
        {
            this.cancelEdit();
        }
        else if ( e.which == 13 ) // Enter
        {
            // Strip html tags (is done on the backend too)

            this.model.set('name', this.$input.attr('value').replace(/<(?:.|\n)*?>/gm, ''));
            this.model.save();
            this.$el.removeClass("editing");
        }
    },

    typeTower: function() {
        this.model.set('type', 'tower');
        this.model.save();
    },

    typeLaptop: function() {
        this.model.set('type', 'laptop');
        this.model.save();
    },

    typeDesktop: function() {
        this.model.set('type', 'desktop');
        this.model.save();
    },

    update: function() {
        this.render( this.$el.find(".in").length != 0 );
    },

    render: function(inAllowed) {
        // Determine whether this is the client device

        var thisdev = currdev !== undefined && currdev !== null && currdev.id == this.model.get('id');
        inAllowed = inAllowed === undefined ? thisdev : inAllowed;
        var details = ( this.$el.find(".btn.details").html() == "Hide details" )
        var templ = this.model.toJSON();

        this.$el.html(this.template(templ));

        if ( inAllowed ) this.$el.find(".accordion-body").addClass("in");

        if ( !inAllowed )
            this.$el.find(".accordion-body").removeClass("in");


        if ( details )
        {
            this.$el.find("table").show();
            this.$el.find(".btn.details").html("Hide details");
        }

        if ( this.$el.find(".accordion-body").hasClass("in") )
            this.selectThis();

        this.$el.find("a[rel=tooltip]").tooltip();
        this.$input = this.$("input.edit");
        this.$editlink = this.$("a.edit");
        return this;
    }
});

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
