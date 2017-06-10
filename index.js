let GitHub = require('github-api');
let Promise = require('bluebird');
let ghcrawler = require('./crawler.js');
let sentiment = require('sentiment');

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
    }))).reduce((acc, cur) => acc.concat(cur), []);

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

async function getBasicUserProfile(username) {
  let userCommits = await getAllUserCommits(username);
  let userEvents = await getEvents(username);

  let commitMessages = userCommits.map(c => c.commit.message);
  let userSentiment = await getSentimentAnalysis(userCommits);
  let userPunchCard = await getPunchCard(username);
}

function getSentimentAnalysis(textArray) {
  let sentimentArray = textArray.map(text => sentiment(text));
  let avg = sentimentArray.reduce((acc, sent) => acc + sent.score, 0) / sentimentArray.length;
  console.log('Average sentiment score: ' + avg);
  return { average: avg, data: sentimentArray };
}

async function getPunchCard(username) {

}

async function getEvents(username, type) {

}

rateLimit.getRateLimit()
  .then(function({data}) {
    console.log(`${data.resources.core.remaining} of ${data.resources.core.limit} requests available until reset.`);
});

commits = getAllUserCommits('manafount');
// .then(c => console.log(c));
// getEvents('frankbi322');
// getSentimentAnalysis(["message", "other message", "commit messages suck", "you're the worst", "I love this repo!"]);
