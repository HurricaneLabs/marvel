require([
    "splunkjs/mvc",
    "jquery",
], function(mvc, $) {

    var submitted_tokens = mvc.Components.getInstance("submitted");
    var comic_search = mvc.Components.getInstance('comic_search');
    var other_comics_search = mvc.Components.getInstance('other_comics_search');
    var select_comics = mvc.Components.getInstance('select_comics');
    var comic_search_results = comic_search.data("results", { count : 0 });
    var other_comics_results = other_comics_search.data("results", { count : 0 });

    comic_search_results.on("data", function() {
        var rows = comic_search_results.data().rows;
        $('#comic_detail').empty();
        rows.forEach(function (row) {
            var html = '<div id="img_wrapper">' +
                        '<img src="' + row[0] + '"/>' +
                        '</div>' +
                        '<div id="description">' +
                        '<h2>' + row[2] + '</h2>' +
                        '<p>' + row[1] + '</p>' +
                        '</div>';
            $('#comic_detail').append(html);
        });
        $('#comic_detail').fadeIn(2000);
    });

    other_comics_results.on("data", function() {
        var rows = other_comics_results.data().rows;
        $('#other_comics').empty().append('<h2>Check Out These Other Comics</h2>');
        rows.forEach(function (row) {
            var url = row[0];
            var title = row[1];
            var html = '<a href="#" data-img="' + title + '"><img src="' +
                        url + '" class="other_comic"/></a>';
            $('#other_comics').append(html);
        });
        $('#other_comics').fadeIn(2000);
    });

    $(document.body).on('click', '.other_comic', function(e) {
        e.preventDefault();
        $('#comic_detail').fadeOut(1000);
        $('#other_comics').fadeOut(1000, function() {
            var img_title = $(this).parent().data('img');
            submitted_tokens.set({ 'comic_title_tok' : img_title });
            comic_search.startSearch();
            other_comics_search.startSearch();
        }.bind(this));
    });

    select_comics.on("change", function(val) {
        submitted_tokens.unset('comic_name_tok');
        submitted_tokens.set('comic_title_tok', val);
        $('#comic_detail').fadeOut(1000);
        $('#other_comics').fadeOut(1000);
        other_comics_search.startSearch();
    });

});