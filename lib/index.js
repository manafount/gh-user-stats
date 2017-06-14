let request = require('request');
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
      // 409 = Duplicate Request. Probably safe to ignore.
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
  let userSentiment = await getSentimentAnalysis(commitMessages);
  let userPunchCard = await getPunchCard(username);
}

function getSentimentAnalysis(textArray) {
  let sentimentArray = textArray.map(text => sentiment(text));
  let scores = sentimentArray.map(sent => sent.score);
  let max = Math.max.apply(null, scores);
  let min = Math.min.apply(null, scores);
  let mostPositive = {
    text: textArray.find(text => sentiment(text).score === max),
    score: max
  };
  let leastPositive = {
    text: textArray.find(text => sentiment(text).score === min),
    score: min
  };
  let avg = scores.reduce((acc, score) => acc + score) / sentimentArray.length;
  // REMOVE THESE!
  console.log(`Most positive (${mostPositive.score} points): ${mostPositive.text}`);
  console.log(`Least positive (${leastPositive.score} points): ${leastPositive.text}`);
  console.log('Average sentiment score: ' + avg);
  console.log([max, min, avg]);
  return {
    mostPositive: mostPositive,
    leastPositive: leastPositive,
    max: max,
    min: min,
    average: avg,
    data: sentimentArray };
}

async function getPunchCard(repos) {

}

async function getEvents(username, type) {

}

rateLimit.getRateLimit()
  .then(function({data}) {
    console.log(`${data.resources.core.remaining} of ${data.resources.core.limit} requests available until reset.`);
});

let commits = getAllUserCommits('manafount')
  .then(commits => {
    messages = commits.map(commit => commit.commit.message);
    getSentimentAnalysis(messages);
  })
