require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc, TableView) {
     // Row Coloring Example with custom, client-side range interpretation

    console.log('Loading...');

    var tables = [
        'breachDetailsTable',
        'activeInactiveUsersTable',
        'corporateRecordsTable',
        'infectedUsersTable'
    ];

    var CustomCellRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cell) {
            // Enable this custom cell renderer for both the active_hist_searches and the active_realtime_searches field
            return _(['Active Employee?']).contains(cell.field);
        },
        render: function($td, cell) {
            // Add a class to the cell based on the returned value
            var value = cell.value;
            // Apply interpretation for number of historical searches
            if (cell.field === 'Active Employee?') {
                if (value === "Yes") {
                    $td.addClass('severe');
                }
            }

            // Update the cell content
            $td.text(value);
        
	}
    });

    for (var i=0; i < tables.length; i++) {
        if(mvc.Components.get(tables[i]) != null) {
            mvc.Components.get(tables[i]).getVisualization(function(tableView) {
                // Add custom cell renderer, the table will re-render automatically.
                tableView.addCellRenderer(new CustomCellRenderer());
            });
        } 
    }
});
//# sourceURL=table_highlight.js
