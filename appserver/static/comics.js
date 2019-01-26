require([
    "underscore",
    "backbone",
    "splunkjs/mvc",
    "jquery",
], function( _, Backbone, mvc, $) {

    var submitted_tokens = mvc.Components.get("submitted");
    var comic_search = mvc.Components.getInstance('comic_search');
    var other_comics_search = mvc.Components.getInstance('other_comics_search');
    var select_comics = mvc.Components.getInstance('select_comics');
    var comic_search_results = comic_search.data("results", { count : 0 });

    $('#comic_detail').hide();

    comic_search_results.on("data", function () {
        $('#comic_detail').hide().fadeIn(1000);
    });

    var other_comics_results = other_comics_search.data("results", { count : 0 });

    other_comics_results.on("data", function () {
        var rows = other_comics_results.data().rows;
        $('#other_comics').empty().append('<h2>Check Out These Other Comics</h2>');
        rows.forEach(function (row) {
            var url = row[0];
            var title = row[1];
            var html = '<a href="#" data-img="' + title + '"><img src="' + url + '" class="other_comic"/></a>';
            $('#other_comics').append(html);
        });
        $('#other_comics').fadeIn(2000);
    });

    $(document.body).on('click', '.other_comic', function(e) {
        e.preventDefault();
        $('#comic_detail').fadeOut(1000);
        $('#other_comics').fadeOut(1000, function() {
            var img_title = $(this).parent().data('img');
            console.log('img_title ', img_title);
            submitted_tokens.set('comic_title_tok', img_title);
            comic_search.startSearch();
            other_comics_search.startSearch();
        }.bind(this));

    });

    select_comics.on("change", function () {
        $('#comic_detail').fadeOut(1000);
        $('#other_comics').fadeOut();
        other_comics_search.startSearch();
    });

});