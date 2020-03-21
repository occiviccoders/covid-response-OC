// note data are from data.js... Im not proud of that, but was quick to hack together
// use cvoc for data object
// charts
let ctx = document.getElementById('chart').getContext('2d');  // for the chart
let chart = null;

// parse the chart data
cvoc.chartTotals = function(){
    return cvoc.counts.reduce(function(returnArray, datum){
        returnArray.labels.push(datum.label);
        returnArray.counts.push(Number(datum.data.find(
            function(criteria){
                return criteria.category==="Total Cases" && criteria.type==="Cases";
            }
        ).count));
        return returnArray;
    },{labels:[], counts:[]});
}

// calculate numbers
const totals = cvoc.chartTotals();

// load the chart
cvoc.chart = new Chart (ctx, {
    type: 'bar',
    data: {
        labels: totals.labels,
        datasets: [{
            label:  'Total Cases',
            data: totals.counts,
        }]
    }
});

