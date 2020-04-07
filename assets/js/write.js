// Currently running as a script to fetch data
const fs = require('fs');
const cvoc= require('./db.js');

    // write the frontend data
    let writeString = "const cvoc = " + JSON.stringify(cvoc, null, 4) + ";\n";
    // write the data
    fs.writeFile('assets/js/data.js', writeString, (err) => { 
        // In case of a error throw err. 
        if (err) throw err; 
    }) 

    //this creates a usable json file.
    fs.writeFile('assets/js/currentData.json', JSON.stringify(cvoc), 
                 (err) => { if(err) throw err;})

    //kaggle can autoupdate a dataset by connecting it to a repo, which allows
    //this data to be used for statistical analysis, which would be very nice