// note data are from data.js... Im not proud of that, but was quick to hack together
// use cvoc for data object
// charts
const ctx_totals = document.getElementById('chart_totals').getContext('2d');  // for the chart
const ctx_age_by_time = document.getElementById('chart_age_by_time').getContext('2d');  // for the chart

// set the categories
cvoc.categories = ['Total Cases', 'Male', 'Female', '<18', '18 - 49', '≥ 65'];

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
        returnArray.datasets[1].data.push(cvoc.getCounts("Total Cases", "Total Deaths", date));
        return returnArray;
    },{
        labels:[],
        datasets: [{
            label:  'Total Cases',
            data: [],
            backgroundColor: 'rgba(198, 91, 16, 0.5)',
            borderColor: 'rgba(198, 91, 16, 1)',
        },{
            label:  'Total Dealths',
            data: [],
            backgroundColor: 'rgb(155, 155, 155, 0.3)',
            borderColor: 'rgb(155, 155, 155, 1)',
            type: 'line',
        }],
    });
}

// parse the count data into chart categories data
cvoc.categoryByTime = function(category){
    return cvoc.counts.reduce(function(returnArray, date){
        returnArray.labels.push(date.label);
        returnArray.datasets[0].data.push(cvoc.getCounts(category, "Travel Related", date));
        returnArray.datasets[1].data.push(cvoc.getCounts(category, "Person to Person Spread*", date));
        returnArray.datasets[2].data.push(cvoc.getCounts(category, "Community Acquired**", date));
        returnArray.datasets[3].data.push(cvoc.getCounts(category, "Under Investigation", date));
        returnArray.datasets[4].data.push(cvoc.getCounts("Total Cases", "Cases", date));
        return returnArray;
    },{
        labels:[],
        datasets: [{
            label:  'Travel Related',
            fill: false,
            data: [],
            backgroundColor: 'rgba(6, 58, 110, 1)',
            borderColor: 'rgba(6, 58, 110, 1)',
        },{
            label:  'Person to Person Spread*',
            fill: false,
            data: [],
            backgroundColor: 'rgba(6, 110, 83, 1)',
            borderColor: 'rgba(6, 110, 83, 1)',
        },{
            label:  'Community Acquired**',
            fill: false,
            data: [],
            backgroundColor: 'rgba(183, 122, 10, 1)',
            borderColor: 'rgba(183, 122, 10, 1)',
        },{
            label:  'Under Investigation',
            fill: false,
            data: [],
            backgroundColor: 'rgba(100, 100, 100, 1)',
            borderColor: 'rgba(100, 100, 100, 1)',
        },{
            label:  'All',
            data: [],
            backgroundColor: 'rgba(200, 200, 200, 0.3)',
            borderColor: 'rgba(200, 200, 200, .3)',
        }],
    });
}

// load category buttons
cvoc.loadButtons = function(){
    cvoc.categories.map(function(category){
        document.getElementById(category).addEventListener("click", function(e){ console.log('hi'); cvoc.updateCategoryByTime(category)}, false);
    });
}

// Update age by time chart
cvoc.updateCategoryByTime = function(category){
    const updated = cvoc.categoryByTime(category);
    cvoc.chart_age_by_time.data.datasets[0].data = updated.datasets[0].data;
    cvoc.chart_age_by_time.data.datasets[1].data = updated.datasets[1].data;
    cvoc.chart_age_by_time.data.datasets[2].data = updated.datasets[2].data;
    cvoc.chart_age_by_time.data.datasets[3].data = updated.datasets[3].data;
    cvoc.chart_age_by_time.options.title.text = category;
    cvoc.chart_age_by_time.update();
}

// load the charts
cvoc.chart_totals = new Chart (ctx_totals, {
    type: 'bar',
    data: cvoc.chartTotals(),
    options: {
        tooltips: {
            mode: 'index'
        },
        legend: {
            position: 'bottom'
        }
    }
});

cvoc.chart_age_by_time= new Chart (ctx_age_by_time, {
    type: 'line',
    data: cvoc.categoryByTime("Total Cases"),
    options: {
        tooltips: {
            mode: 'index'
        },
        legend: {
            position: 'bottom'
        },
        title: {
            display: true,
            text: 'Total Cases',
            fontSize: 20
        }
    }
});

// load buttons
cvoc.loadButtons();
