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

  async getPunchCard(repo) {
    let punchCard;

    this.crawler.queue([{
      uri: repo.url + '/graphs/punch-card-data.json',
      callback: (error, res, done) => {
        if(error){
          console.log(error);
        }else{
          let data = res.body;
          console.log(data);
          punchCard = data;
        }
        done();
      }
    }]);

    return punchCard;
  }
}

module.exports = GithubCrawler;

//For testing purposes!
r = {url: 'https://github.com/manafount/algorithm-racer'}
c = new GithubCrawler();
c.getPunchCard()
  .then((data) => console.log(data));
