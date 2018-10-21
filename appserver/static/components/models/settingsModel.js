define([
    'underscore',
    'backbone',
], function (_, Backbone) {
    "use strict";

    var SettingsModel = Backbone.Model.extend({

        defaults: {
            public_key: "",
            private_key: "",
            success: false,
            failure: false,
            error: "",
            is_configured: false,
            reset: false
        }

    });

    return new SettingsModel();

});