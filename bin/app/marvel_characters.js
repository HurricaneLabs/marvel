(function () {
    var fs = require("fs");
    var path = require("path");
    var splunkjs = require("splunk-sdk");
    var Marvel = require('marvel');
    var MarvelPasswords = require('./MarvelPasswords');
    var ModularInputs = splunkjs.ModularInputs;
    var Logger = ModularInputs.Logger;
    var Event = ModularInputs.Event;
    var Scheme = ModularInputs.Scheme;
    var Argument = ModularInputs.Argument;
    var utils = ModularInputs.utils;
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
            })
        ];
        return scheme;
    };

    exports.validateInput = function (definition, done) {
        var character = definition.parameters.character;
        var service = new splunkjs.Service({sessionKey: definition.metadata["session_key"]});

        getPasswords(service).then(function(passwords) {

            var marvel = new Marvel({
                publicKey: passwords["public_key"],
                privateKey: passwords["private_key"]
            });

            marvel.characters
                .name(character)
                .get(function (err, res) {
                        if (err) {
                            Logger.error(name, "A validation error occurred: " + err.message);
                        }
                        else {
                            Logger.info("Response: ", res);
                            if (res.length === 0) {
                                done(new Error("No results returned for that series, please try again."));
                            } else {
                                done();
                            }
                        }
                    }
                );
        }).catch(function(err) {
            done(new Error(err));
        });

    };

    exports.streamEvents = function (name, singleInput, eventWriter, done) {
        var checkpointDir = this._inputDefinition.metadata["checkpoint_dir"];
        var service = new splunkjs.Service({sessionKey: this._inputDefinition.metadata["session_key"]});
        var character = singleInput.character;

        getPasswords(service).then(function(passwords) {

            var marvel = new Marvel({
                publicKey: passwords["public_key"],
                privateKey: passwords["private_key"]
            });

            var alreadyIndexed = 0;
            var errorFound = false;

            marvel.characters
                .name(character).get(function (err, res) {
                if (err) {
                    Logger.error(name, "An error occurred: " + err.message);
                    return;
                }

                var checkpointFile = path.join(checkpointDir, character + ".txt");
                var checkpointFileNewContents = "";
                var checkpointFileContents = "";

                Logger.info(name, "Retrieving Marvel character information: " + res);

                try {
                    checkpointFileContents = utils.readFile("", checkpointFile);
                }
                catch (e) {
                    // If there's an exception, assume the file doesn't exist
                    // Create the checkpoint file with an empty string
                    fs.appendFileSync(checkpointFile, "");
                }

                for (var i = 0; i < res.length && !errorFound; i++) {

                    var json = {
                        id: res[i].id,
                        name: res[i].name,
                        modified: res[i].modified,
                        description: res[i].description,
                        thumbnail_path: res[i].thumbnail.path,
                        thumbnail_extension: res[i].thumbnail.extension
                    };

                    Logger.info(name, "Data returned for " + character + ": " + json);

                    if (checkpointFileContents.indexOf(res[i].id += res[i].modified + "\n") < 0) {
                        try {
                            var event = new Event({
                                stanza: character,
                                sourcetype: "marvel_characters",
                                data: json, // Have Splunk index our event data as JSON, if data is an object it will be passed through JSON.stringify()
                                time: Date.now() // Set the event timestamp to the time of the search
                            });

                            eventWriter.writeEvent(event);

                            checkpointFileNewContents += res[i].id += res[i].modified + "\n"; // Append this commit to the string we'll write at the end
                            Logger.info(name, "Added a new character: " + res[i].name);
                        }
                        catch (e) {
                            errorFound = true;
                            Logger.error(name, "An error occured: " + e.message);
                            done(e);

                            // We had an error, die.
                            return;
                        }
                    } else {
                        alreadyIndexed++;
                    }

                    fs.appendFileSync(checkpointFile, checkpointFileNewContents); // Write to the checkpoint file

                    if (alreadyIndexed > 0) {
                        Logger.info(name, "Skipped " + alreadyIndexed.toString() + " already indexed the character " + character);
                    }

                    alreadyIndexed = 0;

                }

            });

        }).catch(function(err) {
            done(new Error(err));
        });

    };

    ModularInputs.execute(exports, module);
})();