require([
    "underscore",
    "backbone",
    "splunkjs/mvc",
    "jquery",
], function( _, Backbone, mvc, $) {

    var submitted_tokens = mvc.Components.get("submitted");
    var character_search = mvc.Components.getInstance('character_search');
    var other_characters_search = mvc.Components.getInstance('other_characters_search');
    var select_characters = mvc.Components.getInstance('select_characters');
    var character_search_results = character_search.data("results", { count : 0 });

    $('#character_detail').hide();

    character_search_results.on("data", function() {
        $('#character_detail').hide().fadeIn(1000);
    });

    var other_characters_results = other_characters_search.data("results", { count : 0 });

    other_characters_results.on("data", function() {
        var rows = other_characters_results.data().rows;
        $('#other_characters').empty().append('<h2>Check Out These Other Characters</h2>');
        rows.forEach(function (row) {
            var url = row[0];
            var title = row[1];
            var html = '<a href="#" data-img="' + title + '"><img src="' + url + '" class="other_character"/></a>';
            $('#other_characters').append(html);
        });
        $('#other_characters').fadeIn(2000);
    });

    $(document.body).on('click', '.other_character', function(e) {
        e.preventDefault();
        $('#character_detail').fadeOut(1000);
        $('#other_characters').fadeOut(1000, function() {
            var img_title = $(this).parent().data('img');
            submitted_tokens.set('character_name_tok', img_title);
            character_search.startSearch();
            other_characters_search.startSearch();
        }.bind(this));
    });

    select_characters.on("change", function() {
        $('#character_detail').fadeOut(1000);
        $('#other_characters').fadeOut();
        other_characters_search.startSearch();
    });

});