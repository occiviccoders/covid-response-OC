// Currently running as a script to fetch data
const axios = require("axios");
const cheerio = require('cheerio'), cheerioTableparser = require('cheerio-tableparser');
const fs = require('fs');
const cvoc= require('./data.js');

// scrape for the covid counts
const OCUrl = "https://occovid19.ochealthinfo.com/coronavirus-in-oc";
const fetchData = async (url) => {
    const today = new Date(); 
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const dateString = months[today.getMonth()] + ' ' + today.getDate();
    const result = await axios.get(url);
    const $ = cheerio.load(result.data);
    let jsonData = [];
    let writeString = "";
    // prep the current data to remove todays date
    let updateArray = cvoc.counts.filter(function(datum){
        return datum.label !== dateString;
    });
    cheerioTableparser($);
    // fetch and parse the data
    let text = $('table').filter(function (i, element) {
        let has = $(this).text().indexOf("COVID-19 Case Counts");
        let not = $(this).text().indexOf("Call Ahead");
        if(has>-1 && not<0){
            return $(this);
        }
    }).parsetable(false, false, true);
    // jsonify data    
    for (let x = 1; x < 8; x++) {
        for (let y = 3; y < 9; y++) {
            if(Number(text[x][y])){
                jsonData.push({
                    category:text[x][2],
                    type:text[0][y],
                    count: text[x][y],
                })
            }
        }
    }
    // add the latest data
    updateArray.push({
        label: dateString,
        data: jsonData
    });
    writeString = "const cvoc = {};\ncvoc.counts = " + JSON.stringify(updateArray, null, 4) + ";\nif(module){module.exports = cvoc;}";
    // write the data
    fs.writeFile('assets/js/data.js', writeString, (err) => { 
        // In case of a error throw err. 
        if (err) throw err; 
    })
};
fetchData(OCUrl);

