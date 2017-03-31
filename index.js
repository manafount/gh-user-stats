const fetch = require('isomorphic-fetch');
const headers = new Headers({
    "User-Agent"   : "GH-User-Stats"
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
      totalCommits += numCommits;
    }
    console.log(`${username} has ${totalCommits} total commits.`);
  } catch (err) {
    console.log(err.message);
  }
};

async function getCommits(username, repo) {
  let url = `https://api.github.com/repos/${username}/${repo.name}/stats/contributors`;
  try {
    let response = await fetch(url, { headers : headers });
    let commits = await response.json();
    let numCommits = 0;
    for (let i = 0; i < commits.length; i++) {
      if (commits[i].author.login === username) {
        numCommits = commits[i].total;
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

getRepos('octocat');
// getEvents('frankbi322');
