// Currently running as a script to fetch data
const axios = require("axios");
const cheerio = require('cheerio'), cheerioTableparser = require('cheerio-tableparser');
const fs = require('fs');
const cvoc= require('./db.js');

// scrape for the covid counts
const OCUrl = "https://occovid19.ochealthinfo.com/coronavirus-in-oc";

// function to parse js variables
const parseJS = function(scripts, variable, array){
    let result = scripts.slice(scripts.indexOf(variable));
    if(!array){
        result = result.slice(result.indexOf("datasets"));
        result = result.slice(result.indexOf("data: "));
        result = result.slice(result.indexOf("["), result.indexOf("]")+1);
    } else {
        result = result.slice(result.indexOf("["), result.indexOf("];")+1);        
    }
    return JSON.parse(result);
}

const fetchData = async (url) => {
    const today = new Date(); 
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const dateString = months[today.getMonth()] + ' ' + today.getDate();
    const result = await axios.get(url);
    const $ = cheerio.load(result.data);
    // get the chartjs data from oc health agency
    const scripts = $('script:not([src])')[0].children[0].data;
    let newCvoc = { cities: cvoc.cities };
    let jsonData = [];
    let jsonLocation = [];

    // parse OC heath info data 
    let caseArr = parseJS(scripts, "caseArr", true);
    let hostpitalArr = parseJS(scripts, "hospitalArr", true);
    let ageData = parseJS(scripts, "ageData");
    let sexData = parseJS(scripts, "sexData");
    let ageDeathData = parseJS(scripts, "ageDeathData");
    let sexDeathData = parseJS(scripts, "cumuDeathData");

    jsonData = [
        {
            "category": "Total Cases",
            "type": "Cases",
            "count": caseArr.slice(-1)[0][2],
        },
        {
            "category": "Total Cases",
            "type": "Deaths",
            "count": sexDeathData.reduce(function(a,b){return a + b;},0),
        },
        {
            "category": "Currently",
            "type": "Hospitalized",
            "count": hostpitalArr.slice(-1)[0][1],
        },
        {
            "category": "Currently",
            "type": "ICU",
            "count": hostpitalArr.slice(-1)[0][2],
        },
        {
            "category": "Male",
            "type": "Cases",
            "count": sexData[0],
        },
        {
            "category": "Male",
            "type": "Deaths",
            "count": sexDeathData[0],
        },
        {
            "category": "Female",
            "type": "Cases",
            "count": sexData[1],
        },
        {
            "category": "Female",
            "type": "Deaths",
            "count": sexDeathData[1],
        },
        {
            "category": "Unknown",
            "type": "Cases",
            "count": sexData[2],
        },
        {
            "category": "Unknown",
            "type": "Deaths",
            "count": sexDeathData[2],
        },
        {
            "category": "<18",
            "type": "Cases",
            "count": ageData[0],
        },
        {
            "category": "<18",
            "type": "Deaths",
            "count": ageDeathData[0],
        },
        {
            "category": "18 - 24",
            "type": "Cases",
            "count": ageData[1],
        },
        {
            "category": "18 - 24",
            "type": "Deaths",
            "count": ageDeathData[1],
        },
        {
            "category": "25 - 34",
            "type": "Cases",
            "count": ageData[2],
        },
        {
            "category": "25 - 34",
            "type": "Deaths",
            "count": ageDeathData[2],
        },
        {
            "category": "35 - 44",
            "type": "Cases",
            "count": ageData[3],
        },
        {
            "category": "35 - 44",
            "type": "Deaths",
            "count": ageDeathData[3],
        },
        {
            "category": "45 - 64",
            "type": "Cases",
            "count": ageData[4],
        },
        {
            "category": "45 - 64",
            "type": "Deaths",
            "count": ageDeathData[4],
        },
        {
            "category": "≥ 65",
            "type": "Cases",
            "count": ageData[5],
        },
        {
            "category": "≥ 65",
            "type": "Deaths",
            "count": ageDeathData[5],
        }
    ];

    // prep the current data to remove todays date
    newCvoc.counts = cvoc.counts.filter(function(datum){
        return datum.label !== dateString;
    });    
    // parse location
    cheerioTableparser($);
    // fetch and parse the city data
    let text = $('table').filter(function (i, element) {
        let not = $(this).text().indexOf("2020 Orange County Coronavirus Case Counts");
        let has = $(this).text().indexOf("POPULATION");
        if(has>-1 && not<0){
            return $(this);
        }
    }).parsetable(false, false, true);

    // jsonify data  
    for (let y = 1; y < text[0].length; y++) { 
        jsonLocation.push({
            city:text[0][y],
            population:text[1][y],
            cases: text[2][y],
        })
    }

    // check for new cities
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
};
fetchData(OCUrl);

