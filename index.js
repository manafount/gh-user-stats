let GitHub = require('github-api');
let fetch = require('isomorphic-fetch');
let headers = new Headers({
    "User-Agent"   : "GH-User-Stats"
});
let ghcrawler = require('./crawler.js');

let github = new GitHub({
  username: process.env.GH_LOGIN,
  password: process.env.GH_PASS
});

let rateLimit = github.getRateLimit();

async function getRepos(username) {
  let user = await github.getUser(username);
  let response = await user.listRepos();
  let repos = response.data;
  console.log(repos.length);

  let totalCommits = 0;

  let data = {};

  let allAuthoredCommits = await Promise.all(repos.map(getCommits(username, repo)));

  return data;

  for (let i = 0; i < repos.length; i++) {
    let numCommits = await getCommits(username, repos[i]);
    console.log(`${username} had ${numCommits} commits in ${repos[i].name}`);
    totalCommits += numCommits;
  }
  console.log(`${username} has ${totalCommits} total commits.`);
};

async function getCommits(username, repo) {
  let commits = await repo.listCommits({author: username});
  console.log(`${username} had ${commits.length} commits in ${repo.fullname}`);
  return commits;
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

// testing only - remember to delete these!
github.getUser('test').listRepos()
  .then(function({data}) {
    console.log(data.length);
});

rateLimit.getRateLimit()
  .then(function({data}) {
    console.log(`${data.resources.core.remaining} of ${data.resources.core.limit} requests available until reset.`);
});
getRepos('test');
// getEvents('frankbi322');
