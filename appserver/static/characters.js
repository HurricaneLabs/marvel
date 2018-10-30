require([
    "underscore",
    "backbone",
    "splunkjs/mvc",
    "jquery",
], function( _, Backbone, mvc, $) {

    const submitted_tokens = mvc.Components.get("submitted");
    const character_search = mvc.Components.getInstance('character_search');
    const other_characters_search = mvc.Components.getInstance('other_characters_search');
    const select_characters = mvc.Components.getInstance('select_characters');

    $('#character_detail').hide();

    const character_search_results = character_search.data("results", { count : 0 });

    character_search_results.on("data", () => {
        $('#character_detail').hide().fadeIn(1000);
    });

    const other_characters_results = other_characters_search.data("results", { count : 0 });

    other_characters_results.on("data", () => {
        let rows = other_characters_results.data().rows;
        $('#other_characters').empty().append('<h2>Check Out These Other Characters</h2>');
        rows.forEach((row) => {
            let url = row[0];
            let title = row[1];
            let html = `<a href="#" data-img="${title}"><img src=${url} class="other_character"/></a>`;
            $('#other_characters').append(html);
        });
        $('#other_characters').fadeIn(2000);
    });

    $(document.body).on('click', '.other_character', function(e) {
        e.preventDefault();
        $('#character_detail').fadeOut(1000);
        $('#other_characters').fadeOut(1000, () => {
            let img_title = $(this).parent().data('img');
            submitted_tokens.set('character_name_tok', img_title);
            character_search.startSearch();
            other_characters_search.startSearch();
        });
    });

    select_characters.on("change", () => {
        $('#character_detail').fadeOut(1000);
        $('#other_characters').fadeOut();
        other_characters_search.startSearch();
    });

});