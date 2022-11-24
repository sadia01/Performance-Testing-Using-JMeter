/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1945, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.16825, 500, 1500, "Create Student Address"], "isController": false}, {"data": [0.1805, 500, 1500, "Create Student"], "isController": false}, {"data": [2.5E-4, 500, 1500, "Final Student Details"], "isController": false}, {"data": [0.12025, 500, 1500, "Update Student"], "isController": false}, {"data": [5.0E-4, 500, 1500, "Final Student Details-1"], "isController": false}, {"data": [0.191, 500, 1500, "Final Student Details-0"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.21325, 500, 1500, "Delete Student-1"], "isController": false}, {"data": [0.12475, 500, 1500, "Delete Student-0"], "isController": false}, {"data": [0.158, 500, 1500, "Get Student Details"], "isController": false}, {"data": [0.16525, 500, 1500, "Get Specific Student by ID"], "isController": false}, {"data": [0.012, 500, 1500, "Delete Student"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 24000, 0, 0.0, 5696.463333333343, 0, 27161, 5091.0, 12820.800000000003, 16127.550000000007, 20905.99, 51.10427827983, 70.56375646322728, 12.801022830836322], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Create Student Address", 2000, 0, 0.0, 3759.4109999999996, 58, 12677, 3292.5, 7431.9, 8851.899999999996, 10843.83, 4.278715529598014, 1.3830613674774832, 2.1727852298739916], "isController": false}, {"data": ["Create Student", 2000, 0, 0.0, 3727.3615000000054, 222, 13351, 2643.5, 7810.6, 9533.149999999998, 11108.97, 4.429590550797437, 2.0331128504636675, 1.345315098923831], "isController": false}, {"data": ["Final Student Details", 2000, 0, 0.0, 15556.908999999994, 934, 27161, 15461.5, 21051.9, 22287.149999999994, 24055.55, 4.2707392436093725, 4.967236756971448, 1.5848446411831656], "isController": false}, {"data": ["Update Student", 2000, 0, 0.0, 5093.516000000001, 52, 14048, 4892.0, 10638.8, 10947.8, 13330.52, 4.370552962360797, 1.4255514545200259, 1.4298195726473313], "isController": false}, {"data": ["Final Student Details-1", 2000, 0, 0.0, 11790.014500000008, 750, 23230, 11388.5, 17125.6, 18306.09999999999, 20746.66, 4.271742636049663, 3.0035690409724194, 0.7926084969232774], "isController": false}, {"data": ["Final Student Details-0", 2000, 0, 0.0, 3766.8170000000027, 98, 15006, 3009.5, 7660.700000000001, 9335.949999999993, 11142.96, 4.2783036526017435, 1.9678525589603721, 0.7938258730413391], "isController": false}, {"data": ["Debug Sampler", 2000, 0, 0.0, 0.0915000000000002, 0, 6, 0.0, 0.0, 1.0, 1.0, 4.328573345511053, 1.3837062489449103, 0.0], "isController": false}, {"data": ["Delete Student-1", 2000, 0, 0.0, 3604.9640000000013, 50, 12552, 2910.0, 7719.6, 8303.349999999999, 10908.81, 4.3240625432406254, 1.7693185601736543, 0.7854254228933167], "isController": false}, {"data": ["Delete Student-0", 2000, 0, 0.0, 4337.1115, 50, 13427, 4092.0, 8449.1, 9484.499999999998, 10865.140000000001, 4.321054337258291, 1.9537579669439342, 0.8777141622555903], "isController": false}, {"data": ["Get Student Details", 2000, 0, 0.0, 4337.214499999998, 100, 13755, 4032.0, 8332.1, 10459.049999999996, 11405.75, 4.432496404137292, 47.35361654653678, 0.7704925390004277], "isController": false}, {"data": ["Get Specific Student by ID", 2000, 0, 0.0, 4442.028999999993, 50, 13147, 4400.0, 8490.800000000001, 10181.75, 11314.9, 4.308961131016117, 1.7631393690388215, 0.7826823929384745], "isController": false}, {"data": ["Delete Student", 2000, 0, 0.0, 7942.120500000008, 111, 21160, 8165.0, 12324.6, 13595.049999999992, 16431.13, 4.319934336998078, 3.7208809426096723, 1.662162235134026], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 24000, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
