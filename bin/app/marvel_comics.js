(function () {
    const fs = require("fs");
    const path = require("path");
    const splunkjs = require("splunk-sdk");
    const Marvel = require('marvel');
    const MarvelPasswords = require('./MarvelPasswords');
    const ModularInputs = splunkjs.ModularInputs;
    const Logger = ModularInputs.Logger;
    const Event = ModularInputs.Event;
    const Scheme = ModularInputs.Scheme;
    const Argument = ModularInputs.Argument;
    const utils = ModularInputs.utils;
    const getPasswords = MarvelPasswords.GetPasswords;

    exports.getScheme = function () {
        const scheme = new Scheme("Marvel Comics");

        scheme.description = "Retrieve Marvel comic books.";
        scheme.useExternalValidation = true;
        scheme.useSingleInstance = false;

        scheme.args = [
            new Argument({
                name: "comic",
                dataType: Argument.dataTypeString,
                description: "Comic such as Uncanny X-Men",
                requiredOnCreate: true,
                requiredOnEdit: false
            }),
            new Argument({
                name: "result_limit",
                dataType: Argument.dataTypeNumber,
                description: "Limit the results returned (Minimum: 1, Maximum: 100)",
                requiredOnCreate: true,
                requiredOnEdit: false
            }),
        ];

        Logger.info('Comic Scheme: ', scheme);

        return scheme;
    };

    exports.validateInput = function (definition, done) {
        const comic = definition.parameters.comic;
        const result_limit = definition.parameters.result_limit;
        const service = new splunkjs.Service({sessionKey: definition.metadata["session_key"]});

        if (result_limit < 1) {
            done(new Error("The minimum amount of results allowed is 1."));
        }

        if (result_limit > 100) {
            done(new Error("The maximum amount of results allowed is 100."));
        }

        getPasswords(service).then(function(passwords) {

            const marvel = new Marvel({
                publicKey: passwords["public_key"],
                privateKey: passwords["private_key"]
            });

            Logger.info("Marvel: ", marvel);

            marvel.comics
                .title(comic)
                .get(function (err, res) {
                    if (err) {
                        Logger.error(name, "A validation error occurred: " + err.message);
                        callback(err);
                        return;
                    }
                    else {
                        Logger.info("Response: ", res);
                        if (res.length === 0) {
                            done(new Error("No results returned for that comic, please try again."));
                        } else {
                            done();
                        }
                    }
                });
        }).catch(function(err) {
            done(new Error(err));
        });
    };

    exports.streamEvents = function (name, singleInput, eventWriter, done) {
        const checkpointDir = this._inputDefinition.metadata["checkpoint_dir"];
        const comic = singleInput.comic;
        const result_limit = singleInput.result_limit;
        const service = new splunkjs.Service({sessionKey: this._inputDefinition.metadata["session_key"]});

        getPasswords(service).then(function(passwords) {

            const marvel = new Marvel({
                publicKey: passwords["public_key"],
                privateKey: passwords["private_key"]
            });

            let alreadyIndexed = 0;
            let errorFound = false;

            marvel.comics
                .title(comic)
                .limit(result_limit)
                .get(function (err, res) {
                    if (err) {
                        Logger.error(name, "An error occurred: " + err.message);
                        callback(err);
                        return;
                    }

                    const checkpointFile = path.join(checkpointDir, comic + ".txt");
                    let checkpointFileNewContents = "";
                    let checkpointFileContents = "";

                    Logger.info(name, "Retrieving Marvel comic information: " + res);

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
                            title: res[i].title,
                            modified: res[i].modified,
                            issueNumber: res[i].issueNumber,
                            description: res[i].description,
                            thumbnail_path: res[i].thumbnail.path,
                            thumbnail_extension: res[i].thumbnail.extension
                        };

                        Logger.info(name, "Data returned for " + comic + ": " + json);

                        if (checkpointFileContents.indexOf(res[i].id += res[i].modified + "\n") < 0) {
                            try {
                                var event = new Event({
                                    stanza: comic,
                                    sourcetype: "marvel_comics",
                                    data: json, // Have Splunk index our event data as JSON, if data is an object it will be passed through JSON.stringify()
                                    time: Date.now() // Set the event timestamp to the time of the search
                                });

                                eventWriter.writeEvent(event);

                                checkpointFileNewContents += res[i].id += res[i].modified + "\n"; // Append this commit to the string we'll write at the end
                                Logger.info(name, "Added a new comic: " + res[i].title);
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
                            Logger.info(name, "Skipped " + alreadyIndexed.toString() + " already indexed the comic" + comic);
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