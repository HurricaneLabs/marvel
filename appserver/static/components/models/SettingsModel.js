define([
    'backbone',
], function (Backbone) {
    "use strict";

    var SettingsModel = Backbone.Model.extend({

        defaults: {
            initial_load: true,
            public_key: "",
            public_key_error: "",
            private_key: "",
            private_key_error: "",
            field_errors: false,
            is_configured: false,
            updating: false,
            reset: false,
        }

    });

    return new SettingsModel();

});
