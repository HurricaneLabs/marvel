define([
    'backbone',
], function (Backbone) {

    var SettingsModel = Backbone.Model.extend({

        defaults: {
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
