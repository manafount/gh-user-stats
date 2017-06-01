let Crawler = require('crawler');
let jsdom = require('jsdom');

class GithubCrawler {
  constructor() {
    this.crawler = new Crawler({
      maxConnections : 10,
      skipDuplicates: false,
      // Default callback function - this will be called for each crawled page
      callback : function (error, res, done) {
        if(error){
          console.log(error);
        }else{
          let $ = res.$;
          // $ is Cheerio by default
          // a lean implementation of core jQuery designed specifically for the server
          console.log(res.request.uri.href);
          if(res.request.uri.href.search(/graphs$/) === -1){
            crawler.queue(res.request.uri.href + '/graphs')
          }else{
            console.log($("contributors").html());
          }
        }
        done();
      }
    });
  }

  getPunchCard(repo) {
    this.crawler.queue([{
      uri: repo.url + '/graphs/punch-card',
      callback: (error, res, done) => {
        if(error){
          console.log(error);
        }else{
          let $ = res.$;
          console.log($.html());
        }
        done();
      }
    }])
  }
}

module.exports = GithubCrawler;

//For testing purposes!
r = {url: 'https://github.com/manafount/algorithm-racer'}
c = new GithubCrawler();
c.getPunchCard(r);
