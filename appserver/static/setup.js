require.config({
    paths: {
        text: "../app/marvel/components/lib/text",
        'MarvelTemplate' : '../app/marvel/components/templates/index.html',
        'SettingsView' : '../app/marvel/components/views/SettingsView'
    }
});

require([
    "underscore",
    "backbone",
    "splunkjs/mvc",
    "jquery",
    "splunkjs/mvc/simplesplunkview",
    "SettingsView",
    "text!MarvelTemplate"
], function( _, Backbone, mvc, $, SimpleSplunkView, SettingsView, MarvelTemplate) {

    var MarvelView = SimpleSplunkView.extend({

        className: "MarvelSetupView",

        el: "#MarvelIndexWrapper",

        initialize: function() {
            this.render();
        },

        loadSettings: function() {
            new SettingsView({
                id: "settingsView",
                el: $("#MarvelComponentsWrapper")
            }).render();
        },

        render: function() {

            document.title = "Marvel Setup";
            $(this.el).html(_.template(MarvelTemplate));

            this.loadSettings();

            return this;

        }

    });

    new MarvelView();

});