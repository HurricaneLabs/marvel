require.config({
    paths: {
        text: "../app/marvel/components/lib/text",
        'settingsTemplate' : '../app/marvel/components/templates/settings.html',
        'settingsModel' : '../app/marvel/components/models/settingsModel',
        "setupView" : '../app/marvel/components/views/SetupView',
    }
});

define([
    "underscore",
    "backbone",
    "splunkjs/mvc",
    "jquery",
    "setupView",
    "splunkjs/mvc/simplesplunkview",
    "text!settingsTemplate",
    "settingsModel",
    "models/SplunkDBase",
    "util/splunkd_utils"
], function(
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
){

    var Config = SplunkDBaseModel.extend({
	    initialize: function() {
	    	SplunkDBaseModel.prototype.initialize.apply(this, arguments);
	    }
	});

    return SetupView.extend({

        className: "MarvelConfigView",

        defaults: {
            app_name: "marvel"
        },

        events: {
            "click #submitData" : "submitData",
            "click #resetData" : "resetData",
            "focusout #public_key" : "setAccessKey",
            "focusout #private_key" : "setSecretKey",
        },

        initialize: function() {
            this.options = _.extend({}, this.defaults, this.options);
            SetupView.prototype.initialize.apply(this, [this.options]);
            this.initial_load = true;
            this.model = SettingsModel;
            this.trustedAdvisorInputModel = null;
            this.lookupPopulatorSSModel = null;
            this.marvelConfigModel = null;
            this.listenTo(this.model, 'change', this.render);
            this.success = this.model.get("success");
            this.failure = this.model.get("failure");
            this.errors = [];
        },

        submitData: function(e) {

            e.preventDefault();

            this.model.set({
                "reset" : false
            }, { "silent" : true });

            this.errors = [];
            var field_errors = false;
            //clear form input errors
            $(".input-error").remove();
            $("input").removeClass("red-border");

            fields = {
                'public_key' : [this.model.get("public_key"), 'You must provide an Access key.'],
                'private_key' : [this.model.get("private_key"), 'You must provide a Secret key.'],
            };

            var validateFields = function() {
                for(var key in fields) {
                    if(fields.hasOwnProperty(key)) {
                        var value = fields[key][0];
                        var error_message = fields[key][1];
                        if(value === '') {
                            $("#"+key+"").addClass("red-border");
                            $("<span class=\"input-error\">"+error_message+"</span>").insertAfter("#"+key+"");
                            field_errors = true;
                        }
                    }
                }
            };

            var handleSubmittedData = function(is_configured) {
                this.deleteEncryptedCredential('public_key', true).done(function() {
                    this.deleteEncryptedCredential('private_key', true).done(function () {
                        this.saveEncryptedCredential('public_key', fields['public_key'][0], "");
                        this.saveEncryptedCredential('private_key', fields['private_key'][0], "");
                        this._showSuccessMesage();
                        if(!is_configured) {
                            this.setConfigured();
                        }
                    }.bind(this));
                }.bind(this));
            }.bind(this);

            //Run some basic validation
            validateFields();

            if(!field_errors) {

                $(document).find("#submitData").prop("disabled", true).text("Submitting...");

                //if any errors exist, show them
                if(this.errors.length > 0) {

                    this.model.set({ "failure" :  true, "error" : "Unable to update all the values. Reason(s): " +
                        this.errors});

                    $(document).find("#submitData").prop("disabled", false).text("Submit");

                }

                handleSubmittedData(this.is_app_configured);

            }

        },

        resetData: function(e) {
            e.preventDefault();
            $(e.currentTarget).prop("disabled", true).text("Resetting...");

            this.model.set({
                "reset" : true
            });
        },

        _showSetupMessage: function() {
            $(document).find(".settingUp").fadeIn();
        },

        _showSuccessMesage: function() {

             setTimeout(function() {

                $(document).find("#submitData").prop("disabled", false).text("Submit");

                this.model.set({ "success" : true,
                    "failure" :  false,
                    "error" : "",
                    "public_key" : "<encrypted>",
                    "private_key" : "<encrypted>"
                });

                $(document).find(".settingUp").fadeOut();

                $(document).find(".success").fadeIn(function() {
                    setTimeout(function() {
                        $(this).fadeOut();
                    }.bind(this), 4000);
                });

            }.bind(this), 3000);

        },

        setAccessKey: function() {

            this.model.set({ "public_key" :  $(document).find('#public_key').val() }, { silent : true });

        },

        setSecretKey: function() {

            this.model.set({ "private_key" :  $(document).find('#private_key').val() }, { silent : true });

        },

        //Do a general to check to see if we have credentials stored in the marvel App
        _getCredentials: function() {
            var service = mvc.createService();
            var authCode = '';
            var promise = new $.Deferred();

            service.get('/services/marvel/marvel_config/config', authCode,
                function(err, response) {
                    if (err) {
                        this.errors.push(err);
                        promise.reject();
                    } else {
                        var content = response.data.entry[0].content;
                        var public_key = content.public_key;
                        var private_key = content.private_key;
                        // Was triggered by a reset action?
                        if(this.model.get("reset")) {
                            this.model.set({
                                "public_key": "",
                                "private_key": "",
                                "is_configured" : false
                            }, { silent : true });
                        } else {
                            this.model.set({
                                "public_key": public_key,
                                "private_key": private_key,
                                "is_configured" : true
                            }, { silent : true });
                        }

                        promise.resolve();
                    }
                }.bind(this)
            );

            return promise;

        },

        /**
         * Get the app configuration. Override -- Added Promise
         */
        _getAppConfig: function(){

            var promise = new $.Deferred();
            // Use the current app if the app name is not defined
            if(this.app_name === null || this.app_name === undefined){
                this.app_name = mvc_utils.getCurrentApp();
            }

	        this.app_config = new Config();

            this.app_config.fetch({
                url: splunkd_utils.fullpath('/servicesNS/nobody/system/apps/local/' + this.app_name),
                success: function (model, response, options) {
                    console.info("Successfully retrieved the app configuration");
                    this.is_app_configured = model.entry.associated.content.attributes.configured;
                    promise.resolve()
                }.bind(this),
                error: function () {
                    console.warn("Unable to retrieve the app configuration");
                    promise.reject();
                }.bind(this)
            });

            return promise;
        },

        render: function() {
            console.log("reset? ", this.model.get("reset"));

            if(this.initial_load) {
                this.$el.html("<p>Loading Setup Page...</p>");
                this.initial_load = false;
            }

            this._getAppConfig().done(function() {
                if(this.is_app_configured) {
                    this._getCredentials().done(function() {
                        this.$el.html(_.template(SettingsTemplate, this.model.toJSON()));
                    }.bind(this));
                } else {
                    this.$el.html(_.template(SettingsTemplate, this.model.toJSON()));
                }
            }.bind(this));

            return this;

        }
    });

});