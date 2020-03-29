// set the mapbox token
mapboxgl.accessToken = "pk.eyJ1IjoiaW5pdGlhbGFwcHMiLCJhIjoiY2pzMnBzZGZnMDM0azQ5bDdyOHdraHV1ZyJ9.JdYkI5UwxhJgJOkbm2_8rw";

// note data are from data.js... Im not proud of that, but was quick to hack together
// use cvoc for data object
// charts
const ctx_totals = document.getElementById('chart_totals').getContext('2d');  // for the chart
const ctx_gender = document.getElementById('chart_gender').getContext('2d');  // for the chart
const ctx_age = document.getElementById('chart_age').getContext('2d');  // for the chart
const ctx_age_by_time = document.getElementById('chart_age_by_time').getContext('2d');  // for the chart

// set the categories
cvoc.categories = ['Total Cases', 'Male', 'Female', '<18', '18 - 49', '50 - 64', '≥ 65'];

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

// parse the count data into chartjs format data
cvoc.chartTotals = function(){
    return cvoc.counts.reduce(function(returnArray, date){
        returnArray.labels.push(date.label);
        returnArray.datasets[0].data.push(cvoc.getCounts("Total Cases", "Cases", date));
        returnArray.datasets[1].data.push(cvoc.getCounts("Total Cases", "Deaths", date));
        return returnArray;
    },{
        labels:[],
        datasets: [{
            label:  'Total Cases',
            data: [],
            backgroundColor: 'rgba(198, 91, 16, 0.6)',
            borderColor: 'rgba(198, 91, 16, 1)',
        },{
            label:  'Deaths',
            data: [],
            backgroundColor: 'rgb(155, 155, 155, 0.3)',
            borderColor: 'rgb(155, 155, 155, 1)',
            type: 'line',
        }],
    });
}

// parse the count data by gender
cvoc.chartByGender = function(){
    const last = cvoc.counts.slice(-1)[0];
    const data = last.data.reduce(function(returnArray, datum){
        if (datum.category==='Male' && datum.type==='Cases'){
            returnArray[0] += Number(datum.count);
        }
        if (datum.category==='Female' && datum.type==='Cases'){
            returnArray[1] += Number(datum.count);
        }
        return returnArray;
    },[0, 0])
    return {
        labels:['Male', 'Female'],
        datasets: [{
            data: data,
            backgroundColor: ['rgb(63, 127, 191, 0.6)','rgba(187, 26, 163, 0.6)']
        }],
    }
}

// parse the count data by age
cvoc.chartByAge = function(){
    const last = cvoc.counts.slice(-1)[0];
    const data = last.data.reduce(function(returnArray, datum){
        if (datum.category==='<18' && datum.type==='Cases'){
            returnArray[0] += Number(datum.count);
        }
        if (datum.category==='18 - 24' && datum.type==='Cases'){
            returnArray[1] += Number(datum.count);
        }
        if (datum.category==='25 - 34' && datum.type==='Cases'){
            returnArray[2] += Number(datum.count);
        }
        if (datum.category==='35 - 44' && datum.type==='Cases'){
            returnArray[3] += Number(datum.count);
        }
        if (datum.category==='45 - 64' && datum.type==='Cases'){
            returnArray[4] += Number(datum.count);
        }
        if (datum.category==='≥ 65' && datum.type==='Cases'){
            returnArray[5] += Number(datum.count);
        }
        return returnArray;
    },[0, 0, 0, 0, 0, 0])
    return {
        labels:['Under 18', '18 to 24', '25 to 34', '35 to 44', '45 to 64', '65 and Over'],
        datasets: [{
            data: data,
            backgroundColor: ["#250902","#376E3F", "#F2D396","#DBB164","#FF9A17","#C6601B"]
        }],
    }
}

// parse the data into geoJson
cvoc.geoJson = function(){
    const last = cvoc.counts.slice(-1)[0];
    return {
        "type": "FeatureCollection",
        "features": cvoc.cities.map(function(city){
            // get individual city data
            let cityData = last.location.find(function(datum){
                return datum.city === city.city && city.city!=='All';
            })
            // get all city data
            if(!cityData && city.city === "All"){
                cityData = {
                    city: "All",
                    population: last.location.find(function(datum){ return datum.city === "Total Population" }).population,
                    cases: last.location.find(function(datum){ return datum.city === "Total Cases" }).cases,
                }
            }
            cityData.population = Number(cityData.population);
            cityData.cases = Number(cityData.cases);
            return {
                "type": "Feature",
                "properties": cityData,
                "geometry": {
                    "type": "Point",
                    "coordinates": city.location,
                }
            }
        })
    }
}

// parse the count data into chart categories data
cvoc.categoryByTime = function(category){
    return cvoc.counts.reduce(function(returnArray, date, index){
        // oc stopped catagorizing after mar 26 (21 data points)
        if(index<21){
            returnArray.labels.push(date.label);
            returnArray.datasets[0].data.push(cvoc.getCounts(category, "Travel Related", date));
            returnArray.datasets[1].data.push(cvoc.getCounts(category, "Person to Person Spread*", date));
            returnArray.datasets[2].data.push(cvoc.getCounts(category, "Community Acquired**", date));
            returnArray.datasets[3].data.push(cvoc.getCounts(category, "Under Investigation", date));
            returnArray.datasets[4].data.push(cvoc.getCounts("Total Cases", "Cases", date));            
        }
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

// sets the daily trend
cvoc.dailyTrend = function(){
    const trendElement = document.getElementById("trend");
    const today = cvoc.chart_totals.data.datasets[0].data.slice(-1)[0];
    const yesterday = cvoc.chart_totals.data.datasets[0].data.slice(-2)[0];
    const percent = 100*(today-yesterday)/yesterday;
    let trend = "";
    if(percent<0){
        trend = "down " + Math.abs(percent.toFixed(0)) + "%";
        trendElement.style.color = "green";
    } else {
        trend = "up " + percent.toFixed(0) + "%";
        trendElement.style.color = "#d80000";
    }
    trendElement.style.textDecoration = "underline";
    trendElement.style.fontStyle = "italic";
    trendElement.innerHTML = trend;
}

// activate category buttons
cvoc.loadButtons = function(){
    cvoc.categories.map(function(category){
        document.getElementById(category).addEventListener("click", function(e){ cvoc.updateCategoryByTime(category)}, false);
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
            position: 'bottom',
            labels: {
                fontSize: 16
            }
        },
        aspectRatio: 1.5,
    }
});

cvoc.chart_gender = new Chart (ctx_gender, {
    type: 'doughnut',
    data: cvoc.chartByGender(),
    options: {
        legend: {
            position: 'bottom',
            labels: {
                fontSize: 16
            }
        },
        title: {
            display: true,
            text: 'By Gender',
            fontSize: 20
        },
        aspectRatio: 1.2,
    }
});

cvoc.chart_age = new Chart (ctx_age, {
    type: 'doughnut',
    data: cvoc.chartByAge(),
    options: {
        legend: {
            position: 'bottom',
            labels: {
                fontSize: 16
            }
        },
        title: {
            display: true,
            text: 'By Age',
            fontSize: 20
        },
        aspectRatio: 1.2,
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
            display: false,
        },
        title: {
            display: true,
            text: 'Total Cases',
            fontSize: 20
        },
        aspectRatio: 1.5,
    }
});

// load the map
cvoc.map = new mapboxgl.Map({
    container: "map",
    style: 'mapbox://styles/mapbox/light-v9',
    center: cvoc.cities[0].location,
    zoom: 9,
})
cvoc.map.on('load', function(){
    // define the map popup
    let popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'cvoc-popup',
        maxWidth: '600px'
    })
    // parse the city data to json
    let data = cvoc.geoJson();
    // fitler out the 'all' city
    data.features = data.features.filter(function(feature){
        return feature.properties.city !== 'All';
    })
    // add the city source data
    cvoc.map.addSource('cityLayer', {
        type: 'geojson',
        data: data,
    })
    cvoc.map.addLayer({
        'id': 'city',
        'type': 'circle',
        'source': 'cityLayer',
        'paint': {
            'circle-radius': ['number', ['get', 'cases']],
            'circle-color': '#e55e5e',
            'circle-opacity': 0.6,
        }
    })
    /*                ['boolean',
                  ['feature-state', 'hover'],
                  false
                ],
                0.8,
                0.6,
                */
    // create the map popup
    cvoc.map.on('mouseenter', 'city', function(element){
        const city = element.features[0].properties.city;
        const description = '<div class="row"><div class="col text-center"><h2><b>' + element.features[0].properties.cases + '</b></h2></div><div class="col popup-description">Total Cases<br><strong>' + city + "</strong></div></div>";
        const coordinates = element.features[0].geometry.coordinates.slice();
        // change cursor to pointer
        cvoc.map.getCanvas().style.cursor = 'pointer';
        popup.setLngLat(coordinates).setHTML(description).addTo(cvoc.map);
        /*map.setFeatureState({
            source: 'cityLayer',
            city: city,
        }, {
            hover: true
        });*/
    })
})

// get the daily rates
cvoc.dailyTrend();
// load buttons
cvoc.loadButtons();
