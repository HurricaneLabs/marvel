var Marvel = require('marvel');
var fs = require("fs");


const marvel = new Marvel({
    publicKey: '6e34f83f47f74a36e2a46aa0d2ce760e',
    privateKey: 'a37b4256130a08743953e48d28adf5f32f8b4c9c'
});

var checkpointFileNewContents = '';

marvel.comics
    .title("infinity countdown")
    .limit(1)
    .get(function (err, res) {
    if (err) {
        console.error('Error: ', err);
    } else {

        for (var i = 0; i < res.length; i++) {
            const data = {
                id: res[i].id,
                title: res[i].title,
                issueNumber: res[i].issueNumber,
                description: res[i].description,
                thumbnail_path: res[i].thumbnail.path,
                thumbnail_extension: res[i].thumbnail.extension
            };

            checkpointFileNewContents += res[i].id += res[i].modified + "\n";

            console.log(data);
            fs.appendFileSync("./sample.txt", checkpointFileNewContents);

        }

    }
});