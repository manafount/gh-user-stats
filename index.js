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
  let repoList = await response.data;
  let repos = repoList.map(repo => github.getRepo(repo.owner.login, repo.name))
  let totalCommits = 0;
  let allAuthoredCommits = await Promise.all(repos.map(repo => getCommits(username, repo)
    .catch(err => {
      if (err.response.status === 409) return;
      console.log(err);
    }
  )));
  totalCommits += allAuthoredCommits.map(commits => commits.length)
    .reduce((acc, val) => acc + val, 0);
  console.log(`${username} has ${totalCommits} total commits.`);
};

async function getCommits(username, repo) {
  let response = await repo.listCommits({author: username});
  let commits = await response.data;
  console.log(commits.length);
  return commits
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

rateLimit.getRateLimit()
  .then(function({data}) {
    console.log(`${data.resources.core.remaining} of ${data.resources.core.limit} requests available until reset.`);
});
getRepos('manafount');
// getEvents('frankbi322');
