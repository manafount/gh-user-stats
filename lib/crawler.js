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
          console.log(res.request.uri.href);
          if(res.request.uri.href.search(/graphs$/) === -1){
            this.crawler.queue(res.request.uri.href + '/graphs');
          }else{
            console.log($("contributors").html());
          }
        }
        done();
      }
    });
  }

  async getPunchCard(repo) {
    let punchCard = await this.crawler.queue([{
      uri: repo.url,
      callback: (error, res, done) => {
        let data;
        if(error){
          console.log(error);
        }else{
          data = res.body;
        }
        done(data);
      }
    }]);

    return punchCard;
  }
}

module.exports = GithubCrawler;

//For testing purposes!
const r = {url: 'https://github.com/manafount/algorithm-racer'};
const c = new GithubCrawler();
c.getPunchCard(r);
  // .then((data) => console.log(data));
