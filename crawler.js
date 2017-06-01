let Nightmare = require('nightmare');

class GithubCrawler {
  constructor() {
    this.nightmare = Nightmare({ show: true });

  }

  getPunchCard(repo) {
    // this.crawler.queue([{
    //   uri: repo.url + '/graphs/punch-card',
    //   callback: (error, res, done) => {
    //     if(error){
    //       console.log(error);
    //     }else{
    //       let $ = res.$;
    //       console.log($.html());
    //     }
    //     done();
    //   }
    // }])
    let start = process.hrtime();
    this.nightmare
      .goto(repo.url + '/graphs/punch-card')
      .wait('.viz')
      .evaluate(function(){
        console.log('evaluating');
        return document.querySelectorAll('.viz');
      })
      .end()
      .then(function(html){
        console.log(JSON.stringify(html));
        let elapsed = process.hrtime(start);
        console.log(`Scraped punch card in ${elapsed[0]}.${elapsed[1]} seconds.`);
      })

  }
}

module.exports = GithubCrawler;

//For testing purposes!
r = {url: 'https://github.com/electron/electron'}
c = new GithubCrawler();
c.getPunchCard(r);
