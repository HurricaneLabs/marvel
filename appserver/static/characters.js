require([
    "splunkjs/mvc",
    "jquery",
], function(mvc, $) {

    var submitted_tokens = mvc.Components.getInstance("submitted");
    var character_search = mvc.Components.getInstance('character_search');
    var other_characters_search = mvc.Components.getInstance('other_characters_search');
    var select_characters = mvc.Components.getInstance('select_characters');
    var character_search_results = character_search.data("results", { count : 0 });
    var other_characters_results = other_characters_search.data("results", { count : 0 });

    character_search_results.on("data", function() {
        var rows = character_search_results.data().rows;
        $('#character_detail').empty();
        rows.forEach(function (row) {
            var html = '<div id="img_wrapper">' +
                        '<img src="' + row[0] + '"/>' +
                        '</div>' +
                        '<div id="description">' +
                        '<h2>' + row[2] + '</h2>' +
                        '<p>' + row[1] + '</p>' +
                        '</div>';
            $('#character_detail').append(html);
        });
        $('#character_detail').fadeIn(2000);
    });

    other_characters_results.on("data", function() {
        var rows = other_characters_results.data().rows;
        $('#other_characters').empty().append('<h2>Check Out These Other Characters</h2>');
        rows.forEach(function (row) {
            var url = row[0];
            var title = row[1];
            var html = '<a href="#" data-img="' + title + '"><img src="' +
                        url + '" class="other_character"/></a>';
            $('#other_characters').append(html);
        });
        $('#other_characters').fadeIn(2000);
    });

    $(document.body).on('click', '.other_character', function(e) {
        e.preventDefault();
        $('#character_detail').fadeOut(1000);
        $('#other_characters').fadeOut(1000, function() {
            var img_title = $(this).parent().data('img');
            submitted_tokens.set({ 'character_name_tok' : img_title });
            character_search.startSearch();
            other_characters_search.startSearch();
        }.bind(this));
    });

    select_characters.on("change", function(val) {
        submitted_tokens.unset('character_name_tok');
        submitted_tokens.set('character_name_tok', val);
        $('#character_detail').fadeOut(1000);
        $('#other_characters').fadeOut(1000);
        other_characters_search.startSearch();
    });

});