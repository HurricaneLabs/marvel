(function(){

    exports.GetPasswords = function(service) {
        return new Promise(function (resolve, reject) {
            service.get('/servicesNS/nobody/marvel/storage/passwords', '',
                function (err, response) {
                    let passwords = [];
                    if (err) {
                        reject(err);
                    } else {
                        response.data.entry.forEach(function (entry) {
                            if (entry.name === ':private_key:') {
                                passwords['private_key'] = entry.content.clear_password;
                            }
                            if (entry.name === ':public_key:') {
                                public_key = entry.content.clear_password;
                                passwords['public_key'] = entry.content.clear_password;
                            }
                        });
                        resolve(passwords);
                    }
                });
            });
    }

})();