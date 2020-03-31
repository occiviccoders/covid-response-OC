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
        "features": cvoc.cities.reduce(function(cities, city, index){
            // get individual city data
            let cityData = last.location.find(function(datum){
                return datum.city === city.city;
            })
            if(cityData){
                cityData.population = Number(cityData.population.replace(",", ""));
                cityData.cases = Number(cityData.cases.replace(",", ""));
                cityData.normalized = cityData.cases/cityData.population;
                cityData.displayed = cityData.cases; // a dynamic display variable
                // filter out city with no case data
                if(!isNaN(cityData.cases)){
                    cities.push({
                        "type": "Feature",
                        "id": index,
                        "properties": cityData,
                        "geometry": {
                            "type": "Point",
                            "coordinates": city.location,
                        }
                    })
                }
            }
            return cities;
        },[])
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
    container: "cvoc-map",
    style: 'mapbox://styles/mapbox/light-v9',
    center: cvoc.cities[0].location,
    zoom: 9,
})

cvoc.map.on('load', function(){

    // parse the city data to json
    let data = cvoc.geoJson();
    // fitler out the 'Total' city
    data.features = data.features.filter(function(feature){
        return feature.properties.city !== 'All of Orange County';
    })

    // initialize the display value
    cvoc.displayed = 'Total Cases';

    // define the map popup
    cvoc.popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'cvoc-popup',
        maxWidth: '600px'
    })

    // add the city source data
    cvoc.map.addSource('cityLayer', {
        type: 'geojson',
        data: data,
    })

    // set the layer and styling
    cvoc.map.addLayer({
        'id': 'city',
        'type': 'circle',
        'source': 'cityLayer',
        'paint': {
            'circle-radius': [
                'case',
                [
                    'boolean',
                    ['feature-state', 'hover'],
                    false
                ],
                ['*', 1.25, ['number', ['get', 'displayed']]],
                ['number', ['get', 'displayed']],
            ],
            'circle-color': [
                'case',
                [
                    'boolean',
                    ['feature-state', 'hover'],
                    false
                ],
                '#FF4C4C',
                '#e55e5e',
            ],
            'circle-opacity': [
                'case',
                [
                    'boolean',
                    ['feature-state', 'hover'],
                    false
                ],
                0.7,
                0.6,
            ],
        }
    })

    // show the map popup
    cvoc.map.on('mouseenter', 'city', function(element){
        const city = element.features[0].properties.city;
        const description = '<div class="row"><div class="col text-center"><h2><b>' + element.features[0].properties.displayed + '</b></h2></div><div class="col popup-description">' + cvoc.displayed  + '<br><strong>' + city + "</strong></div></div>";
        const coordinates = element.features[0].geometry.coordinates.slice();
        // change cursor to pointer
        cvoc.map.getCanvas().style.cursor = 'pointer';
        cvoc.popup.setLngLat(coordinates).setHTML(description).addTo(cvoc.map);
    })

    // for touch devices
    cvoc.map.on('touchstart', 'city', function(element){
        const city = element.features[0].properties.city;
        const description = '<div class="row"><div class="col text-center"><h2><b>' + element.features[0].properties.displayed + '</b></h2></div><div class="col popup-description">' + cvoc.displayed  + '<br><strong>' + city + "</strong></div></div>";
        const coordinates = element.features[0].geometry.coordinates.slice();
        cvoc.popup.setLngLat(coordinates).setHTML(description).addTo(cvoc.map);
    })

    // dynamic bubble style
    cvoc.map.on('mousemove', 'city', function(element) {
        if (element.features.length > 0) {
            if (cvoc.hover) {
                // set the hover attribute to false with feature state
                cvoc.map.setFeatureState({
                    source: 'cityLayer',
                    id: cvoc.hover
                }, {
                    hover: false
                });
            }
            cvoc.hover = element.features[0].id;
            // set the hover attribute to true with feature state
            cvoc.map.setFeatureState({
                source: 'cityLayer',
                id: cvoc.hover
            }, {
                hover: true
            });
        }
    });

    // for touch devices
    cvoc.map.on('touchemove', 'city', function(element) {
        if (element.features.length > 0) {
            if (cvoc.hover) {
                // set the hover attribute to false with feature state
                cvoc.map.setFeatureState({
                    source: 'cityLayer',
                    id: cvoc.hover
                }, {
                    hover: false
                });
            }
            cvoc.hover = element.features[0].id;
            // set the hover attribute to true with feature state
            cvoc.map.setFeatureState({
                source: 'cityLayer',
                id: cvoc.hover
            }, {
                hover: true
            });
        }
    });

    cvoc.map.on('mouseleave', 'city', function() {
        cvoc.map.getCanvas().style.cursor = '';
        cvoc.popup.remove();
    });

    cvoc.loadSelect = function() {
        // load the map select button
        document.getElementById('map-select').addEventListener('change', function() {
            cvoc.displayed = this.value;
            cvoc.popup.remove(); // clear popup
            // re parse the geodata
            data.features = data.features.map(function(city){
                if(cvoc.displayed === 'Total Cases'){
                    city.properties.displayed = city.properties.cases;         
                } else {
                    city.properties.displayed = Math.round(city.properties.normalized * 100000);
                }
                return city;
            });
            cvoc.updateMap(data);
            cvoc.updateSidebar(data);
        });        
    }

    // function to update the map
    cvoc.updateMap = function(data) {
        cvoc.map.getSource('cityLayer').setData(data);
    }

    // function to update the sidebar 
    cvoc.updateSidebar = function(){
        const sidebar = d3.select('#cvoc-map-sidebar');
        const maxDisplayed = Math.max.apply(Math, data.features.map(function(city) { return city.properties.displayed; }))
        // update the sidebar
        sidebar.selectAll("div.map-sidebar-row")
        .sort(function(a, b){
            return d3.descending(a.properties.displayed, b.properties.displayed);
        })
        .html(function(d,i){
            return d.properties.city + ' (' + d.properties.displayed + ')';
        })
        .transition().duration(500)
        .style("top", function(d, i) {
            return ((i*26)) + "px";
        })
        .style("background", function(d,i){
            const percent = (100*(d.properties.displayed/maxDisplayed)).toFixed();
            return "-webkit-linear-gradient(left, #DDDDDD, #DDDDDD " + percent + "%, transparent " + percent + "%, transparent 100%)"
        })
    }
    
    // function to load the sidebar
    cvoc.loadSidebar = function () {
        const sidebar = d3.select('#cvoc-map-sidebar');
        sidebar.selectAll("div.map-sidebar-row")
        .data(data.features)
        .enter()
        .append('div')
        .attr("class", "map-sidebar-row")
        .html(function(d,i){
            return d.properties.city + ' (' + d.properties.displayed + ')';
        }).on("mouseover", function(element){
            const city = element.properties.city;
            const description = '<div class="row"><div class="col text-center"><h2><b>' + element.properties.displayed + '</b></h2></div><div class="col popup-description">' + cvoc.displayed  + '<br><strong>' + city + "</strong></div></div>";
            const coordinates = element.geometry.coordinates.slice();
            cvoc.popup.setLngLat(coordinates).setHTML(description).addTo(cvoc.map);
            cvoc.map.setFeatureState({
                source: 'cityLayer',
                id: element.id
            }, {
                hover: true
            });
        }).on("mouseleave", function(element){
            cvoc.popup.remove();
            cvoc.map.setFeatureState({
                source: 'cityLayer',
                id: element.id
            }, {
                hover: false
            });
        });
        // sort by descending
        cvoc.updateSidebar();
    }

    // load the buttons
    cvoc.loadSelect();
    cvoc.loadSidebar();

})

// get the daily rates
cvoc.dailyTrend();
// load buttons
cvoc.loadButtons();
