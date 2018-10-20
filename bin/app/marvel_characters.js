(function () {
    const fs = require("fs");
    const path = require("path");
    const splunkjs = require("splunk-sdk");
    const Marvel = require('marvel');
    const ModularInputs = splunkjs.ModularInputs;
    const Logger = ModularInputs.Logger;
    const Event = ModularInputs.Event;
    const Scheme = ModularInputs.Scheme;
    const Argument = ModularInputs.Argument;
    const utils = ModularInputs.utils;

    exports.getScheme = function () {
        const scheme = new Scheme("Marvel Characters");

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
        const character = definition.parameters.character;

        Logger.info('marvel characters definition.sessionKey ', definition.metadata["session_key"]);

        Logger.info("character submitted for validation: ", character);

        const marvel = new Marvel({
            publicKey: '6e34f83f47f74a36e2a46aa0d2ce760e',
            privateKey: 'a37b4256130a08743953e48d28adf5f32f8b4c9c'
        });

        marvel.characters
            .name(character)
            .get(function(err, res) {
                if (err) {
                    Logger.error(name, "A validation error occurred: " + err.message);
                    return;
                }
                else {
                    Logger.info("Response: ", res);
                    if (res.length === 0) {
                        done(new Error("No results returned for that series, please try again."));
                    } else {
                        done();
                    }
                }
            });
    };

    exports.streamEvents = function (name, singleInput, eventWriter, done) {
        const checkpointDir = this._inputDefinition.metadata["checkpoint_dir"];
        const character = singleInput.character;

        const marvel = new Marvel({
            publicKey: '6e34f83f47f74a36e2a46aa0d2ce760e',
            privateKey: 'a37b4256130a08743953e48d28adf5f32f8b4c9c'
        });

        let alreadyIndexed = 0;
        let errorFound = false;
        let working = true;

        marvel.characters
            .name(character).get(function (err, res) {
            if (err) {
                Logger.error(name, "An error occurred: " + err.message);
                return;
            }

            const checkpointFile = path.join(checkpointDir, character + ".txt");
            let checkpointFileNewContents = "";
            let checkpointFileContents = "";

            Logger.info(name, "Retrieving Marvel character information: " + res);

            try {
                checkpointFileContents = utils.readFile("", checkpointFile);
            }
            catch (e) {
                // If there's an exception, assume the file doesn't exist
                // Create the checkpoint file with an empty string
                fs.appendFileSync(checkpointFile, "");
            }

            for (let i = 0; i < res.length && !errorFound; i++) {

                const json = {
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
                        working = false; // Stop streaming if we get an error.
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

    };

    ModularInputs.execute(exports, module);
})();
