require.config({
    paths: {
        text: "../app/marvel/components/lib/text",
        'SettingsTemplate': '../app/marvel/components/templates/settings.html',
        'SettingsModel': '../app/marvel/components/models/SettingsModel',
        "SetupView": '../app/marvel/components/views/SetupView',
    }
});

define([
    "underscore",
    "backbone",
    "splunkjs/mvc",
    "jquery",
    "SetupView",
    "splunkjs/mvc/simplesplunkview",
    "text!SettingsTemplate",
    "SettingsModel",
    "models/SplunkDBase",
    "util/splunkd_utils"
], function (
    _,
    Backbone,
    mvc,
    $,
    SetupView,
    SimpleSplunkView,
    SettingsTemplate,
    SettingsModel,
) {

    return SetupView.extend({

        className: "MarvelConfigView",

        defaults: {
            app_name: "marvel"
        },

        events: {
            "click #submitData": "submitData",
            "click #resetData": "resetData",
            "focusout #public_key": "setPublicKey",
            "focusout #private_key": "setPrivateKey",
        },

        initialize: function () {
            this.options = _.extend({}, this.defaults, this.options);
            SetupView.prototype.initialize.apply(this, [this.options]);
            this.initial_load = true;
            this.model = SettingsModel;
            this.listenTo(this.model, 'change', this.render);
        },

        handleSubmittedData: function() {
            this.deleteEncryptedCredential('public_key', true).then(() => {
                this.deleteEncryptedCredential('private_key', true).then(() => {
                    this.saveEncryptedCredential('public_key', this.model.get("public_key"), "");
                    this.saveEncryptedCredential('private_key', this.model.get("private_key"), "");
                    this.setConfigured().then(() => { this.showSuccessMessage(); },
                        (reason) => {
                            console.error('Unable to set app as configured. Reason: ', reason);
                        });
                }, (reason) => {
                    console.error('Unable to delete private key. Reason: ', reason);
                });
            }, (reason) => {
                console.error('Unable to delete public key. Reason: ', reason);
            });
        },

        validateFields: function(fields) {
            fields.forEach((field) => {
                let field_name = Object.keys(field);
                let field_value = this.model.get(Object.keys(field));
                let field_error = Object.values(field)[0];
                let attribute = {};
                field_value === "" ?
                    (
                        attribute[field_name+"_error"] = field_error,
                        this.model.set({ "field_errors" : true })
                    ) :
                    (
                        attribute[field_name+"_error"] = "",
                        this.model.set({ "field_errors" : false })
                    );
                // attribute expands to this.model.set(<public|private>_key_error : <field_error>)
                // We do this since we are attempting to dynamically set the model's object value
                this.model.set(attribute);
            });
        },

        submitData: function (e) {

            e.preventDefault();

            let fields = [
                { 'public_key' : 'You must provide an public key.' },
                { 'private_key' : 'You must provide a private key.' },
            ];

            // Run some basic validation
            this.validateFields(fields);

            // If there are no form errors
            if (!this.model.get("field_errors")) {
                this.model.set({ "updating" : true });
                this.handleSubmittedData();
            }
        },

        setConfiguredModel: function() {
            this.model.set({
                "public_key": "<encrypted>",
                "private_key": "<encrypted>",
                "reset" : false,
                "is_configured": true,
                "updating": false
            });
        },

        setUnconfiguredModel: function() {
            this.model.set({
                "private_key" : "",
                "public_key" : "",
                "reset" : true,
                "is_configured" : false,
            });
        },

        resetData: function (e) {
            e.preventDefault();
            this.setUnconfiguredModel();
        },

        showSuccessMessage: function () {
            $(document).find(".success")
                .delay(1000)
                .fadeIn(1000)
                .delay(2000)
                .fadeOut(1000, () => {
                    this.setConfiguredModel();
                });
        },

        setPublicKey: function () {
            this.model.set({"public_key": $(document).find('#public_key').val()}, {silent: true});
        },

        setPrivateKey: function () {
            this.model.set({"private_key": $(document).find('#private_key').val()}, {silent: true});
        },

        render: function () {
            if (this.model.get("initial_load")) {
                this.$el.html(`<p>Loading page setup...</p>`);
                this.model.set({ "initial_load" : false }, { silent : true }); // Silent means do not re-render
            }

            //Check if the app is configured
            this.getAppConfig().then(() => {
                if (this.is_app_configured && !this.model.get("reset")) {
                    //The app is configured so get the credentials
                    this.setConfiguredModel();
                    this.$el.html(_.template(SettingsTemplate, this.model.toJSON()));
                } else {
                    this.$el.html(_.template(SettingsTemplate, this.model.toJSON()));
                }
            }, (error) => {
                console.log('Error getting app configuration state. Reason: ', error);
            });

            return this;
        }
    });

});
