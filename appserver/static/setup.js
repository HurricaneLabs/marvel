require.config({
    paths: {
        text: "../app/marvel/components/lib/text",
        'MarvelTemplate' : '../app/marvel/components/templates/index.html'
    }
});

require([
    "underscore",
    "backbone",
    "splunkjs/mvc",
    "jquery",
    "splunkjs/mvc/simplesplunkview",
    '../app/marvel/components/views/SettingsView',
    "text!MarvelTemplate",
], function( _, Backbone, mvc, $, SimpleSplunkView, SettingsView, MarvelTemplate){

    const MarvelView = SimpleSplunkView.extend({

        className: "MarvelSetupView",

        el: '#MarvelIndexWrapper',

        initialize: function() {
            this.render();
        },

        _loadSettings: function() {
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