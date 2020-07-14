// Currently running as a script to fetch data
const axios = require("axios");
const fs = require('fs');
const cvoc= require('./db.js');

// Get data from these urls
// City URL is broken data is here but locked: https://services2.arcgis.com/LORzk2hk9xzHouw9/ArcGIS/rest/services/VIEW_LAYER_citylayer_covid19_update070620/FeatureServer/0
// http://www.arcgis.com/home/webmap/viewer.html?url=https://services2.arcgis.com/LORzk2hk9xzHouw9/ArcGIS/rest/services/VIEW_LAYER_citylayer_covid19_update070620/FeatureServer/0&source=sd
const cityUrl = "https://services2.arcgis.com/LORzk2hk9xzHouw9/ArcGIS/rest/services/VIEWLAYER_Dashboard_CityUpdate7220/FeatureServer/0/query?where=0%3D0&outFields=%2A&f=json";
const caseUrl = "https://services2.arcgis.com/LORzk2hk9xzHouw9/ArcGIS/rest/services/occovid_democase_csv/FeatureServer/0/query?where=0%3D0&outFields=%2A&f=json";
const deathUrl = "https://services2.arcgis.com/LORzk2hk9xzHouw9/ArcGIS/rest/services/occovid_demodth_csv/FeatureServer/0/query?where=0%3D0&outFields=%2A&f=json";
const hospUrl = "https://data.ca.gov/api/3/action/datastore_search?resource_id=42d33765-20fd-44b8-a978-b083b7542225&q=Orange&sort=todays_date%20desc&limit=5";

// create todays date string
const today = new Date(); 
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dateString = months[today.getMonth()] + ' ' + today.getDate();

// object to store today's data
let todayData = { label: dateString };

// get the existing covid dataset on this app
let newCvoc = { cities: cvoc.cities };
// prep the current data to remove todays date
newCvoc.counts = cvoc.counts.filter(function(datum){
    return datum.label !== dateString;
});

// writes the data to js files
const writeData = async () => {

    // to query the hospital data, we use the previous date and convert to iso to match the api data
    let dateQuery = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
    dateQuery.setDate(dateQuery.getDate() - 1);
    dateQuery.setUTCHours(0,0,0,0);
    dateQuery = dateQuery.toISOString().slice(0,-5);

    // Pull Hospital data
    const hospResult = await axios.get(hospUrl);
    const hospData = hospResult.data.result.records.find(function(county){
        return county.county === "Orange" && county.todays_date === dateQuery;
    });
    if (!hospData){
        console.log("err - hospital data")
    }
    
    // Get case data
    const caseResult = await axios.get(caseUrl);
    const caseData = caseResult.data.features[0].attributes;

    const deathResult = await axios.get(deathUrl);
    const deathData = deathResult.data.features[0].attributes;

    // Parse data
    const jsonData = [
        {
            "category": "Total Cases",
            "type": "Cases",
            "count": caseData.total_cases,
        },
        {
            "category": "Total Cases",
            "type": "Deaths",
            "count": deathData.total_dth,
        },
        {
            "category": "Currently",
            "type": "Hospitalized",
            "count": hospData.hospitalized_covid_confirmed_patients,
        },
        {
            "category": "Currently",
            "type": "ICU",
            "count": hospData.icu_covid_confirmed_patients,
        },
        {
            "category": "Male",
            "type": "Cases",
            "count": caseData.case_male,
        },
        {
            "category": "Male",
            "type": "Deaths",
            "count": deathData.dth_male,
        },
        {
            "category": "Female",
            "type": "Cases",
            "count": caseData.case_female,
        },
        {
            "category": "Female",
            "type": "Deaths",
            "count": deathData.dth_female,
        },
        {
            "category": "Unknown",
            "type": "Cases",
            "count": caseData.case_unk_sex,
        },
        {
            "category": "Unknown",
            "type": "Deaths",
            "count": deathData.dth_unk_sex,
        },
        {
            "category": "Other",
            "type": "Cases",
            "count": caseData.case_oth_sex,
        },
        {
            "category": "Other",
            "type": "Deaths",
            "count": deathData.dth_oth_sex,
        },
        {
            "category": "<18",
            "type": "Cases",
            "count": caseData.case_0_17,
        },
        {
            "category": "<18",
            "type": "Deaths",
            "count": deathData.dth_0_17,
        },
        {
            "category": "18 - 24",
            "type": "Cases",
            "count": caseData.case_18_24,
        },
        {
            "category": "18 - 24",
            "type": "Deaths",
            "count": deathData.dth_18_24,
        },
        {
            "category": "25 - 34",
            "type": "Cases",
            "count": caseData.case_25_34,
        },
        {
            "category": "25 - 34",
            "type": "Deaths",
            "count": deathData.dth_25_34,
        },
        {
            "category": "35 - 44",
            "type": "Cases",
            "count": caseData.case_35_44,
        },
        {
            "category": "35 - 44",
            "type": "Deaths",
            "count": deathData.dth_35_44,
        },
        {
            "category": "45 - 54",
            "type": "Cases",
            "count": caseData.case_45_54,
        },
        {
            "category": "45 - 54",
            "type": "Deaths",
            "count": deathData.dth_45_54,
        },
        {
            "category": "55 - 64",
            "type": "Cases",
            "count": caseData.case_55_64,
        },
        {
            "category": "55 - 64",
            "type": "Deaths",
            "count": deathData.dth_55_64,
        },
        {
            "category": "65 - 74",
            "type": "Cases",
            "count": caseData.case_65_74,
        },
        {
            "category": "65 - 74",
            "type": "Deaths",
            "count": deathData.dth_65_74,
        },
        {
            "category": "75 - 84",
            "type": "Cases",
            "count": caseData.case_75_84,
        },
        {
            "category": "75 - 84",
            "type": "Deaths",
            "count": deathData.dth_75_84,
        },
        {
            "category": "≥ 85",
            "type": "Cases",
            "count": caseData.Case_85,
        },
        {
            "category": "≥ 85",
            "type": "Deaths",
            "count": deathData.dth_85,
        }
    ];

    // function to convert number to string
    const numToString = function(x) {
        if(x){
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");            
        } else {
            return "";
        }
    }

    // pull data from OC arcgis dashboard and parse
    const cityResult = await axios.get(cityUrl);
    const jsonLocation = cityResult.data.features.map(function(city){
        let population = city.attributes.Total_Pop;
        if(population){
            population = numToString(city.attributes.Total_Pop);
        } else {
            population = "Not Available"
        }
        return { 
            city: city.attributes.City,
            population: population,
            cases: numToString(city.attributes.Tot_Cases)
        }
    }).filter(function(city){
        return city.city;
    }).sort(function(a, b){
        if ( a.city < b.city ){
            return -1;
        }
        if ( a.city > b.city ){
            return 1;
        }
        return 0;
    });

    // add all of OC
    jsonLocation.push({
        "city": "All of Orange County",
        "population": "3,222,498",
        "cases": numToString(caseData.total_cases),
        "deaths": numToString(deathData.total_dth)
    })

    // check for any new cities
    jsonLocation.map(function(city){
        let checkData = newCvoc.cities.find(function(index){
            return index.city === city.city || city.city === "Other*" || city.city === "Unknown**";
        })
        if(!checkData){
            newCvoc.cities.push({
                city: city.city,
                location: [],
            })
            newCvoc.cities = newCvoc.cities.sort(function(a, b){
                let nameA=a.city.toLowerCase(), nameB=b.city.toLowerCase()
                if (nameA < nameB || nameA === 'All of Orange County') //sort string ascending
                    return -1 
                if (nameA > nameB)
                    return 1
                return 0 //default return value (no sorting)
            });
            console.log(city.city)
        }
    })

    // add the latest data
    newCvoc.counts.push({
        label: dateString,
        data: jsonData,
        location: jsonLocation
    });

    // write the frontend data
    // write the data
    fs.writeFile('assets/js/db.js', "const cvoc = " + JSON.stringify(newCvoc, null, 4) + ";\n" + "module.exports = cvoc;", (err) => { 
        // In case of a error throw err. 
        if (err) throw err; 
    })
}
writeData();

