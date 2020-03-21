// Currently running as a script to fetch data
const axios = require("axios");
const cheerio = require('cheerio'),
cheerioTableparser = require('cheerio-tableparser');
let jsonData = [];
// scrape for the covid counts
const OCUrl = "https://www.ochealthinfo.com/phs/about/epidasmt/epi/dip/prevention/novel_coronavirus";
const fetchData = async (url) => {
    const result = await axios.get(url);
    const $ = cheerio.load(result.data);
    cheerioTableparser($);
    let text = $('table').filter(function (i, element) {
        let has = $(this).text().indexOf("COVID-19 Case Counts");
        let not = $(this).text().indexOf("Call Ahead");
        if(has>-1 && not<0){
            return $(this);
        }
    }).parsetable(false, false, true);
    // jsonify data    
    for (x = 1; x < 8; x++) {
        for (y = 3; y < 9; y++) {
            if(Number(text[x][y])){
                jsonData.push({
                    category:text[x][2],
                    type:text[0][y],
                    count: text[x][y],
                })
            }
        }
    }
    console.log(jsonData)    
};
fetchData(OCUrl);