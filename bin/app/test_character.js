var Marvel = require('marvel');

const marvel = new Marvel({
    publicKey: '6e34f83f47f74a36e2a46aa0d2ce760e',
    privateKey: 'a37b4256130a08743953e48d28adf5f32f8b4c9c'
});

marvel.characters
    .name("hulk")
    .get(function(err, res) {
    if (err) {
        console.error('Error: ', err);
        return;
    } else {
        const data = {
            id: res[0].id,
            name: res[0].name,
            modified: res[0].modified,
            description: res[0].description,
            thumbnail_path: res[0].thumbnail.path,
            thumbnail_extension: res[0].thumbnail.extension
        };

        console.log(data);
    }
});