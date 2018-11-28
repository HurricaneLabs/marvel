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
    SplunkDBaseModel,
    splunkd_utils
) {

    const Config = SplunkDBaseModel.extend({
        initialize: function () {
            SplunkDBaseModel.prototype.initialize.apply(this, arguments);
        }
    });

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

        submitData: function (e) {

            e.preventDefault();

            this.model.set({
                "reset": false
            }, {"silent": true});

            let field_errors = false;
            $(".input-error").remove();
            $("input").removeClass("red-border");

            let fields = {
                'public_key': [this.model.get("public_key"), 'You must provide an public key.'],
                'private_key': [this.model.get("private_key"), 'You must provide a private key.'],
            };

            const validateFields = () => {
                for (let key in fields) {
                    if (fields.hasOwnProperty(key)) {
                        let value = fields[key][0];
                        let error_message = fields[key][1];
                        if (value === '') {
                            $("#" + key + "").addClass("red-border");
                            $("<span class=\"input-error\">" + error_message + "</span>").insertAfter("#" + key + "");
                            field_errors = true;
                        }
                    }
                }
            };

            const handleSubmittedData = () => {
                this.deleteEncryptedCredential('public_key', true).done(() => {
                    this.deleteEncryptedCredential('private_key', true).done(() => {
                        this.saveEncryptedCredential('public_key', fields['public_key'][0], "");
                        this.saveEncryptedCredential('private_key', fields['private_key'][0], "");
                        this.showSuccessMesage();
                    });
                });
            };

            // Run some basic validation
            validateFields();

            // If there are no form errors
            if (!field_errors) {

                $(document).find("#submitData").prop("disabled", true).text("Submitting...");

                handleSubmittedData();

            }

        },

        resetData: function (e) {
            e.preventDefault();
            $(e.currentTarget).prop("disabled", true).text("Resetting...");

            this.model.set({
                "reset": true
            });
        },

        showSuccessMesage: function () {

            $(document).find(".success")
                .fadeIn(1000).delay(3000)
                .fadeOut(1000, () => {
                    if (!this.is_app_configured) {
                        this.setConfigured();
                    }
                });

            setTimeout(() => {

                this.model.set({
                    "success": true,
                    "public_key": "<encrypted>",
                    "private_key": "<encrypted>"
                });

            }, 4000);

        },

        setPublicKey: function () {

            this.model.set({"public_key": $(document).find('#public_key').val()}, {silent: true});

        },

        setPrivateKey: function () {

            this.model.set({"private_key": $(document).find('#private_key').val()}, {silent: true});

        },

        //Do a general to check to see if we have credentials stored in the marvel App
        getCredentials: function () {
            const service = mvc.createService();
            const promise = new $.Deferred();

            service.get('/services/marvel/marvel_config/config', '',
                (err, response) => {
                    if (err) {
                        console.error(err);
                        promise.reject();
                    } else {
                        const content = response.data.entry[0].content;
                        const public_key = content.public_key;
                        const private_key = content.private_key;
                        // Was triggered by a reset action?
                        if (this.model.get("reset")) {
                            this.model.set({
                                "public_key": "",
                                "private_key": "",
                                "is_configured": false
                            }, {silent: true});
                        } else {
                            this.model.set({
                                "public_key": public_key,
                                "private_key": private_key,
                                "is_configured": true
                            }, {silent: true});
                        }

                        promise.resolve();
                    }
                }
            );

            return promise;

        },

        /**
         * Get the app configuration. Override -- Added Promise
         */
        getAppConfig: function () {

            const promise = new $.Deferred();
            // Use the current app if the app name is not defined
            if (this.app_name === null || this.app_name === undefined) {
                this.app_name = mvc_utils.getCurrentApp();
            }

            this.app_config = new Config();

            this.app_config.fetch({
                url: splunkd_utils.fullpath('/servicesNS/nobody/system/apps/local/' + this.app_name),
                success: (model, response, options) => {
                    this.is_app_configured = model.entry.associated.content.attributes.configured;
                    promise.resolve()
                },
                error: () => {
                    promise.reject();
                }
            });

            return promise;
        },

        render: function () {

            if (this.initial_load) {
                this.$el.html("<p>Loading Setup Page...</p>");
                this.initial_load = false;
            }

            this.getAppConfig().done(() => {
                if (this.is_app_configured) {
                    this.getCredentials().done(() => {
                        this.$el.html(_.template(SettingsTemplate, this.model.toJSON()));
                    });
                } else {
                    this.$el.html(_.template(SettingsTemplate, this.model.toJSON()));
                }
            });

            return this;
        }
    });

});
