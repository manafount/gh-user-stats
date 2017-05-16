let Crawler = require("crawler");
let fetch = require('isomorphic-fetch');
let headers = new Headers({
    "User-Agent"   : "GH-User-Stats"
});

let crawler = new Crawler({
  maxConnections : 10,
  skipDuplicates: false,
  // This will be called for each crawled page
  callback : function (error, res, done) {
    if(error){
      console.log(error);
    }else{
      let $ = res.$;
      // $ is Cheerio by default
      //a lean implementation of core jQuery designed specifically for the server
      // console.log($("title").text());
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

async function getRepos(username) {
  let url = `https://api.github.com/users/${username}/repos`;
  console.log(`Getting repos for user ${username}...`);
  try {
    let response = await fetch(url, { headers : headers });
    console.log(response.headers);
    let repos = await response.json();
    console.log(`Found ${repos.length} repos.`);
    let totalCommits = 0;
    for (let i = 0; i < repos.length; i++) {
      console.log(username, repos[i].name);
      let numCommits = await getCommits(username, repos[i]);
      console.log(`${username} had ${numCommits} commits in ${repos[i].name}`);
      crawler.queue(repos[i].url)
      totalCommits += numCommits;
    }
    console.log(`${username} has ${totalCommits} total commits.`);
  } catch (err) {
    console.log(err.message);
  }
};

async function getCommits(username, repo) {
  let url = `https://api.github.com/repos/${username}/${repo.name}/commits`;
  try {
    let response = await fetch(url, { headers : headers });
    let commits = await response.json();
    let numCommits = 0;
    for (let i = 0; i < commits.length; i++) {
      let committer = commits[i].committer;
      if (committer !== null && committer.login === username) {
        numCommits++;
      }
    }
    return numCommits;
  } catch (err) {
    console.log(err.message);
  }
};

async function getEvents(username) {
  let url = `https://api.github.com/users/${username}/events/public`;
  console.log(`Getting events for user ${username}...`);
  try {
    let response = await fetch(url, { headers : headers });
    let events = await response.json();
    let tallyEvents = {};
    console.log(`Found ${events.length} events.`);
    for (let i = 0; i < events.length; i++) {
      if (tallyEvents[events[i].type] === undefined) {
        tallyEvents[events[i].type] = 0;
      }
      tallyEvents[events[i].type]++;
    }
    console.log(tallyEvents);
  } catch (err) {
    console.log(err.message);
  }
}

getRepos('test');
// getEvents('frankbi322');
