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
  console.log(`${commits.length} commits in ${repo.__fullname}`);
  return commits
};

async function getEvents(username) {

}

rateLimit.getRateLimit()
  .then(function({data}) {
    console.log(`${data.resources.core.remaining} of ${data.resources.core.limit} requests available until reset.`);
});
getRepos('frankbi322');
// // getEvents('frankbi322');
