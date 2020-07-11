# [covid-response-OC](https://www.occiviccoders.com/covid-response-OC/)
A dashboard to track the spread of the Corona Virus (COVID-19) in the local Orange County community. Let's work together to help prevent the spread of this disease! The dashboard includes daily trends by age group, gender, and travel verses community spread.

## Data Sources
The [OC Covid 19 Community Watch](https://www.occiviccoders.com/covid-response-OC/) was made to help the local community monitor covid-19. Data provided by [OC Public Health Care Agency Dashboard](https://ochca.maps.arcgis.com/apps/opsdashboard/index.html#/cc4859c8c522496b9f21c451de2fedae) and [California Open Data Portal](https://data.ca.gov/dataset/covid-19-hospital-data).  

## Navigating This Repo

### Getting Started
* Clone this repo.  
* Make sure you have NPM, and run `npm install`.

### Retrieving Covid Data
* The `assets/js` files have all the scripts to pull data from the APIs and store them.
* There is a node file to get data from the OC Public Health Dashboard and California Open Data Portal, which is currently manually run with the `npm run get` command.  This copies data into `assets/js/db.js`. 
* Unfortunately, as of 7/6, we can no longer pull city numbers as the json file needs a token.  This is an open issue, but for now, I add city data manually...
* After running, I sanity check the data, then run the following command to write out the frontend javascript and json files `npm run write`.  This copies data into `assets/js/data.js` and `assets/js/currentData.json`.  It's a messy process, but a quick and dirty solution for having no back end, with much room for improvement.
* I made a script to push the data to github `npm run push`.
* These commands are run on a daily basis.

### Displaying The Visualizations
* The frontend source code can be found in the `src` directory. To contribute to the source code files in the `src` directory, run `gulp watch` to sync your changes to the `public` directory.

## Built With

### Front End
* [Bootstrap](https://getbootstrap.com/) - Front end framework
* [jQuery](https://jquery.com/) - Needs no introduction
* [chartjs](https://www.chartjs.org/) - Nice charts
* [Mapbox](https://www.mapbox.com/) - For the map
* [d3js](https://d3js.org/) - For the map pareto
* [fontawesome](https://fontawesome.com/) - For the nice icons

### Back End
The backend has no real server.  Just me running scripts and pushing for now.
* [Nodejs](https://nodejs.org/en/) - For scraping and running scripts
* [Babel](https://babeljs.io/) - For compiling ES6 in node so that I can push/pull data from `assets/js/data.js`
* [gulp](https://gulpjs.com/) - To minify and publish JS/CSS from the `src` folder to `public` folder.
* [axios](https://github.com/axios/axios) - to make api calls.

## Authors

* **Andrew Akagawa** - *Initial work* - [OC Civic Coders](https://www.occiviccoders.com)

## Contributing

* Love for you to get involved!  
* The goal of this app is to help the local community in any way to get through the covid-19 pandemic.  All suggestions are welcome.  Submit your ideas as a [github issue](https://github.com/occiviccoders/covid-response-OC/issues)
* For coders, find us on [meetup](https://www.meetup.com/OC-Civic-Coders/) and see our #corona channel on [slack](https://join.slack.com/t/occiviccoders/shared_invite/zt-c7es081j-ShLTVkuKpm5gOKsdiM8szg). 
* Visit the [issues](https://github.com/occiviccoders/covid-response-OC/issues) tab to contribute to open issues.
* Be sure to assign the open task to yourself if you plan to work on it.
* Create a new branch, and start coding.
* When ready, create a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* [OC Public Health Care Agency](https://www.ochealthinfo.com/phs/about/epidasmt/epi/dip/prevention/novel_coronavirus) - For the data
