// Currently running as a script to fetch data
const axios = require("axios");
const cheerio = require('cheerio'), cheerioTableparser = require('cheerio-tableparser');
const fs = require('fs');
const cvoc= require('./db.js');

// scrape for the covid counts
const OCUrl = "https://occovid19.ochealthinfo.com/coronavirus-in-oc";
const fetchData = async (url) => {
    const today = new Date(); 
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const dateString = months[today.getMonth()] + ' ' + today.getDate();
    const result = await axios.get(url);
    const $ = cheerio.load(result.data);
    let newCvoc = { cities: cvoc.cities };
    let jsonData = [];
    let writeString = "";
    // prep the current data to remove todays date
    newCvoc.counts = cvoc.counts.filter(function(datum){
        return datum.label !== dateString;
    });
    cheerioTableparser($);
    // fetch and parse the data
    let text = $('table').filter(function (i, element) {
        let not = $(this).text().indexOf("2020 Orange County Coronavirus Case Counts");
        let has = $(this).text().indexOf("POPULATION");
        if(has>-1 && not<0){
            return $(this);
        }
    }).parsetable(false, false, true);

    // jsonify data  
    for (let y = 1; y < text[0].length; y++) { 
        jsonData.push({
            city:text[0][y],
            population:text[1][y],
            cases: text[2][y],
        })
    }

    // check for new cities
    jsonData.map(function(city){
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
        data: [],
        location: jsonData
    });
    // write the frontend data
    writeString = "const cvoc = " + JSON.stringify(newCvoc, null, 4) + ";\n";
    // write the data
    fs.writeFile('assets/js/data.js', writeString, (err) => { 
        // In case of a error throw err. 
        if (err) throw err; 
    }) 
    // write the db reader for node scraping
    writeString += "module.exports = cvoc;";
    // write the data
    fs.writeFile('assets/js/db.js', writeString, (err) => { 
        // In case of a error throw err. 
        if (err) throw err; 
    })
};
fetchData(OCUrl);

