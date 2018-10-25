define([
    'backbone',
], function (Backbone) {
    "use strict";

    var SettingsModel = Backbone.Model.extend({

        defaults: {
            public_key: "",
            private_key: "",
            success: false,
            failure: false,
            is_configured: false,
            reset: false
        }

    });

    return new SettingsModel();

});