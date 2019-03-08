require.config({
    paths: {
        text: '../app/marvel/components/lib/text',
        'SettingsTemplate': '../app/marvel/components/templates/settings.html',
        'SettingsModel': '../app/marvel/components/models/SettingsModel',
        'SetupView': '../app/marvel/components/views/SetupView',
    }
});

define([
    'underscore',
    'backbone',
    'jquery',
    'SetupView',
    'text!SettingsTemplate',
    'SettingsModel',
], function(
    _,
    Backbone,
    $,
    SetupView,
    SettingsTemplate,
    SettingsModel,
) {

    return SetupView.extend({

        className: "MarvelConfigView",

        events: {
            'click #submitData' : 'submitData',
            'click #resetData' : 'resetData',
            'focusout #public_key' : 'setPublicKey',
            'focusout #private_key' : 'setPrivateKey'
        },

        initialize: function() {
            this.model = SettingsModel;
            this.listenTo(this.model, 'change', this.render);
            SetupView.prototype.initialize.apply(this, [this.options]);
        },

        validateFields: function(fields) {
            var has_errors = false;

            fields.forEach(function (field) {
                var field_name = Object.keys(field);
                var field_value = this.model.get(Object.keys(field));
                var field_error = Object.values(field)[0];
                var attribute = {};

                field_value === '' ?
                    (
                        // field value is empty
                        attribute[field_name+"_error"] = field_error,
                        has_errors = true
                    ) :
                    (
                        // field value is not empty
                        attribute[field_name+"_error"] = ""
                    );
                this.model.set(attribute);
            }.bind(this));

            if(has_errors) {
                this.model.set({ "field_errors" : true });
            } else {
                this.model.set({ "field_errors" : false });
            }

        },

        handleSubmittedData: function() {
            var self = this;
            self.deleteEncryptedCredential('public_key', true)
            .then(function () {
                self.deleteEncryptedCredential('private_key', true)
                .then(function() {
                    self.saveEncryptedCredential('public_key', self.model.get('public_key'), '');
                    self.saveEncryptedCredential('private_key', self.model.get('private_key'), '');
                    self.setConfigured()
                    .then(function () {
                        self.showSuccessMessage();
                    });
                });
            })
        },

        submitData: function(e) {
            e.preventDefault();

            var fields = [
                { 'public_key' : 'You must provide a public key.' },
                { 'private_key' : 'You must provide a private key.' }
            ];

            // validate the fields
            this.validateFields(fields);

            // everything looks good, no validation errors
            if(!this.model.get('field_errors')) {
                // submitting the data
                this.model.set({ "updating" : true });
                this.handleSubmittedData();
            }
        },

        resetData: function(e) {
            e.preventDefault();
            this.setUnconfiguredModel();
        },

        showSuccessMessage: function() {
            var self = this;

            $('.success')
                .delay(1000)
                .fadeIn(1000)
                .delay(2000)
                .fadeOut(1000, function() {
                    self.setConfiguredModel();
                })

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
                "updating" : false
            });
        },

        setPublicKey: function() {
            this.model.set({"public_key": $(document).find('#public_key').val()}, {silent: true});
        },

        setPrivateKey: function() {
            this.model.set({"private_key": $(document).find('#private_key').val()}, {silent: true});
        },

        render: function() {

            this.getAppConfig().then(function() {
                if(this.is_app_configured && !this.model.get("reset")) {
                    this.setConfiguredModel();
                    this.$el.html(_.template(SettingsTemplate, this.model.toJSON()));
                } else {
                    this.$el.html(_.template(SettingsTemplate, this.model.toJSON()));
                }
            }.bind(this));

            return this;

        }

    });

});