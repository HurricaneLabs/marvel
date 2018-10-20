require.config({
    paths: {
        text: "../app/marvel/components/lib/text",
        'MarvelConfigTemplate' : '../app/marvel/components/templates/index.html'
    }
});

require([
    "underscore",
    "backbone",
    "splunkjs/mvc",
    "jquery",
    "splunkjs/mvc/simplesplunkview",
    '../app/marvel/components/views/settingsView',
    "text!MarvelConfigTemplate",
], function( _, Backbone, mvc, $, SimpleSplunkView, SettingsView, MarvelTemplate){

    var MarvelView = SimpleSplunkView.extend({

        className: "MarvelSetupView",

        el: '#MarvelIndexWrapper',

        initialize: function() {
            this.options = _.extend({}, this.options);
            this.render();
        },

        _loadSettings: function() {

            var that = this;
            var configComponents = $('#MarvelConfig-template', this.$el).text();
            console.log('configComponents: ', configComponents);
            $("#content", this.$el).html(_.template(configComponents));

            new SettingsView({
                id: "settingsView",
                el: $('#MarvelComponentsWrapper')
            }).render();
        },

        render: function() {

            document.title = "Marvel Setup";
            $(this.$el).html(_.template(MarvelTemplate));

            this._loadSettings();

            return this;
        }

    });

    new MarvelView();

});