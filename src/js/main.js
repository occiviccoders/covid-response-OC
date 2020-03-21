// note data are from data.js... Im not proud of that, but was quick to hack together
// use cvoc for data object
// charts
let ctx_totals = document.getElementById('chart_totals').getContext('2d');  // for the chart

// gets counts by category and type
cvoc.getCounts = function(category, type, date){
    const datum = date.data.find(function(criteria){
        return criteria.category===category && criteria.type===type;
    });
    if (datum && datum.count) {
        return Number(datum.count);
    } else {
        return 0;
    }
}

// parse the count data into chart totals data
cvoc.chartTotals = function(){
    return cvoc.counts.reduce(function(returnArray, date){
        returnArray.labels.push(date.label);
        returnArray.datasets[0].data.push(cvoc.getCounts("Total Cases", "Cases", date));
        returnArray.datasets[1].data.push(cvoc.getCounts("Total Deaths", "Cases", date));
        return returnArray;
    },{
        labels:[],
        datasets: [{
            label:  'Total Cases',
            data: [],
            backgroundColor: 'rgba(255, 99, 132, 0.3)',
            borderColors: 'rgba(255, 99, 132, 1)',
        },{
            label:  'Total Dealths',
            data: [],
            backgroundColor: 'rgb(155, 155, 155, 0.3)',
            borderColors: 'rgb(155, 155, 155, 1)',
            type: 'line',
        }],
    });
}

// parse the count data into chart catagorys data
cvoc.chartByTypes = function(){
    return cvoc.counts.reduce(function(returnArray, datum){
        returnArray.labels.push(datum.label);
        returnArray.datasets[0].data.push(Number(datum.data.find(
            function(criteria){
                return criteria.category==="Total Cases" && criteria.type==="Cases";
            }
        ).count));
        return returnArray;
    },{
        labels:[],
        datasets: [{
            label:  'Total Cases',
            data: [],
            backgroundColor: 'rgba(255, 99, 132, 0.3)',
            borderColors: 'rgba(255, 99, 132, 1)',
        }]
    });
}

// load the charts
cvoc.chart_totals = new Chart (ctx_totals, {
    type: 'bar',
    data: cvoc.chartTotals(),
    options: {
        tooltips: {
            mode: 'index'
        }
    }
});
/*cvoc.chart_types= new Chart (ctx_types, {
    type: 'bar',
    data: cvoc.chartTotals(),
});*/

