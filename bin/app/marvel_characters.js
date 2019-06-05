(function () {
    var fs = require("fs");
    var path = require("path");
    var splunkjs = require("splunk-sdk");
    var Marvel = require('marvel');
    var ModularInputs = splunkjs.ModularInputs;
    var Logger = ModularInputs.Logger;
    var Event = ModularInputs.Event;
    var Scheme = ModularInputs.Scheme;
    var Argument = ModularInputs.Argument;
    var utils = ModularInputs.utils;
    var MarvelPasswords = require("./marvel_passwords");
    var getPasswords = MarvelPasswords.GetPasswords;

    exports.getScheme = function () {
        var scheme = new Scheme("Marvel Characters");

        scheme.description = "Retrieve characters from the Marvel Universe.";
        scheme.useExternalValidation = true;
        scheme.useSingleInstance = false;

        scheme.args = [
            new Argument({
                name: "character",
                dataType: Argument.dataTypeString,
                description: "Comic character such as The Incredible Hulk",
                requiredOnCreate: true,
                requiredOnEdit: false
            }),
        ];
        return scheme;
    };

    exports.validateInput = function (definition, done) {

        var character = definition.parameters.character;

        var marvel = new Marvel({
            publicKey: '<publicKey>',
            privateKey: '<privateKey>'
        });

        marvel.characters
            .name(character)
            .get(function(err, res) {
                if(err) {
                    Logger.error(name, "A validation error occurred: " + err.message);
                    done(err);
                } else {
                    if(res.length === 0) {
                        done(new Error("No results returned for that series," +
                            " please try again."));
                    } else {
                        done();
                    }
                }
            });

    };

    exports.streamEvents = function () {

    };

    ModularInputs.execute(exports, module);

})();