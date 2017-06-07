let GitHub = require('github-api');
let Promise = require('bluebird');
let ghcrawler = require('./crawler.js');

let github = new GitHub({
  username: process.env.GH_LOGIN,
  password: process.env.GH_PASS
});

let rateLimit = github.getRateLimit();

async function getAllUserCommits(username) {
  let user = await github.getUser(username);
  let response = await user.listRepos();
  let repoList = await response.data;
  let repos = repoList.map(repo => github.getRepo(repo.owner.login, repo.name))
  let result = []

  let allAuthoredCommits = await Promise.all(repos.map(repo => getCommits(username, repo)
    .catch(err => {
      // if (err.response.status === 409) return;
      console.log(err);
    }
  ))).reduce((acc, cur) => acc.concat(cur), []);
  allAuthoredCommits.filter(commit => commit.length > 0);
  console.log(`${username} has ${allAuthoredCommits.length} total commits.`);
  return allAuthoredCommits;
};

async function getCommits(username, repo) {
  let response = await repo.listCommits({author: username});
  let commits = await response.data;
  console.log(`${commits.length} commits in ${repo.__fullname}`);
  return commits
};

async function getPunchCard(username) {

}

async function getEvents(username) {

}

rateLimit.getRateLimit()
  .then(function({data}) {
    console.log(`${data.resources.core.remaining} of ${data.resources.core.limit} requests available until reset.`);
});
getAllUserCommits('manafount');
// // getEvents('frankbi322');
