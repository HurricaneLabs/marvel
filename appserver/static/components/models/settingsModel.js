define([
    'underscore',
    'backbone',
], function (_, Backbone) {
    "use strict";

    var SettingsModel = Backbone.Model.extend({

        defaults: {
            access_key: "",
            secret_key: "",
            region: "",
            success: false,
            failure: false,
            error: "",
            is_configured: false,
            reset: false
        }

    });

    return new SettingsModel();

});