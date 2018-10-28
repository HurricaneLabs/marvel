require([
    "underscore",
    "backbone",
    "splunkjs/mvc",
    "jquery",
], function( _, Backbone, mvc, $) {

    const tokens = mvc.Components.get("default");
    const submitted_tokens = mvc.Components.get("submitted");
    const comic_search = mvc.Components.getInstance('comic_search');
    const other_comics = mvc.Components.getInstance('other_comics');
    const select_comics = mvc.Components.getInstance('select_comics');
    const comic_search_results = comic_search.data("results", { count : 0 });
    const other_comics_results = other_comics.data("results", { count : 0 });

    $('#top_row').hide();

    comic_search_results.on("data", () => {
        $('#top_row').hide().delay(2000).fadeIn(1000);
    });

    other_comics_results.on("data", () => {
        let rows = other_comics_results.data().rows;
        $('#other_comics').fadeIn(2000);
        rows.forEach((row) => {
            let url = row[0];
            let title = row[1];
            let html = `<a href="#" data-img="${title}"><img src=${url} class="other_comic"/></a>`;
            $('#other_comics').append(html);
        });
    });

    $(document.body).on('click', '.other_comic', function(e) {
        e.preventDefault();
        $('#top_row').fadeOut(1000);
        $('#other_comics').fadeOut(1000, () => {
            let img_title = $(this).parent().data('img');
            submitted_tokens.set('comic_title_tok', img_title);
            tokens.set('form.comic_title_tok', img_title);
            comic_search.startSearch();
            other_comics.startSearch();
        });

    });

    select_comics.on("change", () => {
        $('#top_row').fadeOut(1000);
        other_comics.startSearch();
    });

});