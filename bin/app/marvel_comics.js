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
    var MarvelPasswords = require('./marvel_passwords');
    var getPasswords = MarvelPasswords.GetPasswords;

    exports.getScheme = function () {
        var scheme = new Scheme("Marvel Comics");

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
                description: "Limit the result returned (Minimum: 1, Maximum: 100)",
                requiredOnCreate: true,
                requiredOnEdit: false
            }),
        ];
        return scheme;
    };

    exports.validateInput = function (definition, done) {

        var comic = definition.parameters.comic;
        var result_limit = definition.parameters.result_limit;
        var service = new splunkjs.Service({ sessionKey : definition.metadata["session_key"] });


        if(result_limit < 1) {
            done(new Error("The minimum amount of results allowed is 1."));
        }

        if(result_limit > 100) {
            done(new Error("The maximum amount of results allowed is 100."));
        }

        getPasswords(service).then(function(passwords) {

            var marvel = new Marvel({
                publicKey: passwords['public_key'],
                privateKey: passwords['private_key']
            });

            marvel.comics
                .title(comic)
                .get(function (err, res) {
                    if (err) {
                        Logger.error(name, "A validation error occurred: " + err.message);
                        done(err);
                    } else {
                        if (res.length === 0) {
                            done(new Error("No results returned for that comic," +
                                " please try again."));
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
        var checkpointDir = this._inputDefinition.metadata["checkpoint_dir"];
        var service = new splunkjs.Service({ sessionKey : this._inputDefinition.metadata["session_key"] });
        var comic = singleInput.comic;
        var result_limit = singleInput.result_limit;

        getPasswords(service).then(function(passwords) {

            var marvel = new Marvel({
                publicKey: passwords['public_key'],
                privateKey: passwords['private_key']
            });

            var alreadyIndexed = 0;
            var errorFound = false;

            marvel.comics.title(comic).limit(result_limit).get(function (err, res) {
                if (err) {
                    done(err);
                }

                var checkpointFilePath = path.join(checkpointDir, comic + ".txt");
                var checkpointFileNewContents = "";
                var checkpointFileContents = "";

                try {
                    checkpointFileContents = utils.readFile("", checkpointFilePath);
                } catch (e) {
                    fs.appendFileSync(checkpointFilePath, "");
                }

                for (var i = 0; i < res.length && !errorFound; i++) {
                    var json = {
                        id: res[i].id,
                        title: res[i].title,
                        issueNumber: res[i].issueNumber,
                        description: res[i].description,
                        modified: res[i].modified,
                        thumbnail_path: res[i].thumbnail.path,
                        thumbnail_extension: res[i].thumbnail.extension
                    };

                    if (checkpointFileContents.indexOf(res[i].id += res[i].modified + "\n") < 0) {
                        try {
                            var event = new Event({
                                stanza: comic,
                                sourcetype: "marvel_comics",
                                data: json,
                                time: Date.now()
                            });

                            eventWriter.writeEvent(event);

                            checkpointFileNewContents += res[i].id += res[i].modified + "\n";

                            Logger.info(name, "Added a new comic: " + res[i].name);

                        } catch (e) {
                            errorFound = true;
                            Logger.error(name, "An error occured: " + e.message);
                            done(e);
                        }
                    } else {
                        alreadyIndexed++;
                    }

                }

                fs.appendFileSync(checkpointFilePath, checkpointFileNewContents);

                if (alreadyIndexed > 0) {
                    Logger.info(name, "Skipped " + alreadyIndexed.toString() +
                        " already indexed the character" + character);
                }

                alreadyIndexed = 0;

            });
        }).catch(function(err) {
            done(new Error(err));
        });
    };

    ModularInputs.execute(exports, module);

})();