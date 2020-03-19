// note map data are imported from data.js... Im not proud of that, but was quick to hack together
// use cvocData for data array
const OCgeo = [-117.8311, 33.7175]
let cvoc = {};  

// update the map
let updateMap = function(){
    // map the area
    map.getSource('mapLayers').setData(cvoc.setPlaces);
}

// set each area to the map when clicked
let setCategory = function(category){
    // update the category
    cvoc.setPlaces = cvocData;
    if(category){
        cvoc.setPlaces.features.filter(function(place){
            return place.properties.category === category;
        });
    }
    // map the area
    updateMap();
}

// initiate MapBox
mapboxgl.accessToken = "pk.eyJ1IjoiaW5pdGlhbGFwcHMiLCJhIjoiY2pzMnBzZGZnMDM0azQ5bDdyOHdraHV1ZyJ9.JdYkI5UwxhJgJOkbm2_8rw";
map = new mapboxgl.Map({
    container: "map",
    style: 'mapbox://styles/mapbox/light-v9',
    center: OCgeo,
    zoom: 8
}); 

// Load Map
map.on('load', function() {

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.addSource("mapLayers", {
        "type": "geojson",
        "data": cvocData
    });

    map.addLayer({
        'id': 'place',
        'type': 'circle',
        'source': 'mapLayers',
        'paint': {
            // color circles by category
            'circle-color': [
                'match',
                ['get', 'category'],
                'Food Bank',
                '#5a3fc0',
                'Homeless Shelter',
                '#fbb03b',
                'Donate Blood',
                '#e55e5e',
                /* other */ '#ccc'
            ]
        }
    });

    map.on('mouseenter', 'place', function(e) {

        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';
        let coordinates = e.features[0].geometry.coordinates.slice();
        let description = "<b>" + e.features[0].properties.name + "</b><br>" +
            "<i>" + e.features[0].properties.category + "</i><br>" +
            "<span>" + e.features[0].properties.address + "," + e.features[0].properties.city + "," + e.features[0].properties.state + " " + e.features[0].properties.zip + "</span><br>" +
            "<span>" + e.features[0].properties.phone + "</span><br>";
        
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
    });

    map.on('mouseleave', 'place', function() {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });

    // loads the sidebar on initialization
    cvoc.loadSidebar = function (){
        const areaSidebar = document.getElementById('sidebar-list');
        // create an all element
        let sideElementAll = document.createElement('div');
        // clear divs
        areaSidebar.innerHTML = '';
        // adds all element to the bottom
        sideElementAll.classList.add('row');
        sideElementAll.innerHTML = '<div class="col"><span class="tag" onclick="setCategory()"> All</span></div>';
        areaSidebar.appendChild(sideElementAll);  
        // Add all areas to sidebar
        cvocData.features.reduce(function(returnArray, place){
            // search for existing category
            let exists = returnArray.find(function(index){
                return index.properties.category === place.properties.category;
            })
            // add category if not exists
            if (!exists){
                returnArray.push(place);
            }
            return returnArray;
        },[]).map(function(place){
            if(place.properties.category){
                // format the string
                let category = "'" + place.properties.category + "'";
                // creates each side place
                let sideElement = document.createElement('div');
                // for each category add a sidebar element
                sideElement.classList.add('row');
                sideElement.innerHTML = '<div class="col"><span class="tag ' + place.properties.class + '" onclick="setCategory(' + category + ')">' + place.properties.category + '</span></div>';
                areaSidebar.appendChild(sideElement);                        
            }
        });                          
    }

    // load sidebar
    cvoc.loadSidebar();
});