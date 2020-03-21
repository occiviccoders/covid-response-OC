const axios = require("axios");
const cheerio = require('cheerio'),
cheerioTableparser = require('cheerio-tableparser');

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
        
    }).parsetable(true, true, true);;
    console.log(text)
    
};
fetchData(OCUrl);
/*
$.getJSON('https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.ochealthinfo.com/phs/about/epidasmt/epi/dip/prevention/novel_coronavirus'), function (data) {
    // get raw data
    let raw = data.contents;
    var parser = new DOMParser();
    var doc    = parser.parseFromString(raw, "text/html");
    var obj    = [].map.call(doc.querySelectorAll('tr'), tr => {
        return [].slice.call(tr.querySelectorAll('td')).reduce( (a,b,i) => {
            return a['prop' + (i+1)] = b.textContent, a;
        }, {});
    });

    console.log(obj)

});*/