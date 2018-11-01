require([
    "underscore",
    "backbone",
    "splunkjs/mvc",
    "jquery",
], function( _, Backbone, mvc, $) {

    const submitted_tokens = mvc.Components.get("submitted");
    const comic_search = mvc.Components.getInstance('comic_search');
    const other_comics_search = mvc.Components.getInstance('other_comics_search');
    const select_comics = mvc.Components.getInstance('select_comics');

    $('#comic_detail').hide();

    const comic_search_results = comic_search.data("results", { count : 0 });

    comic_search_results.on("data", () => {
        $('#comic_detail').hide().fadeIn(1000);
    });

    const other_comics_results = other_comics_search.data("results", { count : 0 });

    other_comics_results.on("data", () => {
        let rows = other_comics_results.data().rows;
        $('#other_comics').empty().append('<h2>Check Out These Other Comics</h2>');
        rows.forEach((row) => {
            let url = row[0];
            let title = row[1];
            let html = `<a href="#" data-img="${title}"><img src=${url} class="other_comic"/></a>`;
            $('#other_comics').append(html);
        });
        $('#other_comics').fadeIn(2000);
    });

    $(document.body).on('click', '.other_comic', function(e) {
        e.preventDefault();
        $('#comic_detail').fadeOut(1000);
        $('#other_comics').fadeOut(1000, () => {
            let img_title = $(this).parent().data('img');
            submitted_tokens.set(   'comic_title_tok', img_title);
            comic_search.startSearch();
            other_comics_search.startSearch();
        });

    });

    select_comics.on("change", () => {
        $('#comic_detail').fadeOut(1000);
        $('#other_comics').fadeOut();
        other_comics_search.startSearch();
    });

});