# covid-response-OC
To help the local community with covid-19. Data provided by [OC Public Health Care Agency](https://www.ochealthinfo.com/phs/about/epidasmt/epi/dip/prevention/novel_coronavirus).  

## Getting Started

* Clone this repo.  
* Make sure you have NPM, and run `npm install`.
* There is a node file to scrape data from the OC Public Health website, that's currently manually run with the `node run scrape` command.  This copies data into `assets/js/data.js`.  It's a messy process, but a quick and dirty solution for having no back end, with much room for improvement.


## Built With

### Front End
* [Bootstrap](https://getbootstrap.com/) - Front end framework
* [jQuery](https://jquery.com/) - Needs no introduction
* [chartjs](https://www.chartjs.org/) - Nice charts
* [fontawesome](https://fontawesome.com/) - For the nice icons

## Back End
The backend has no real server.  Just me running scripts and pushing for now.
* [Nodejs](https://nodejs.org/en/) - For scraping and running scripts
* [Babel](https://babeljs.io/) - For compiling ES6 in node so that I can push/pull data from `assets/js/data.js`
* [gulp](https://gulpjs.com/) - To minify and publish JS/CSS from the `src` folder to `public` folder.

## Authors

* **Andrew Akagawa** - *Initial work* - [OC Civic Coders](https://www.occiviccoders.com)

## Contributing
* Love for you to get involved!  
* For coders, find us on [meetup](https://www.meetup.com/OC-Civic-Coders/) and see our #corona channel on [slack](https://join.slack.com/t/occiviccoders/shared_invite/zt-c7es081j-ShLTVkuKpm5gOKsdiM8szg).
* For suggestions or corrections contact occiviccoders@gmail.com.  

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* [OC Public Health Care Agency](https://www.ochealthinfo.com/phs/about/epidasmt/epi/dip/prevention/novel_coronavirus) - For the data
