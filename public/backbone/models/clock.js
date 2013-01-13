var Clock = Backbone.Model.extend({
    defaults: { h: '09', m: '30', pm: false },

    toString: function() {
        return this.get('h') + ':' + this.get('m')
    },

    h: function() {
        return this.get('h')
    },

    m: function() {
        return this.get('m')
    },

    pm: function() {
        return this.get('pm')
    },

    togglepm: function() {
        this.set('pm', !this.get('pm'))
    }
})
