const fetch = require('isomorphic-fetch');

async function getRepos(username) {
  let url = `https://api.github.com/users/${username}/repos`
  console.log(`Getting repos for user ${username}...`)
  try {
    let response = await fetch(url);
    let repos = await response.json();
    console.log(`Found ${repos.length} repos.`);
    for (let i = 0; i < repos.length; i++) {
      console.log(`Author of ${repos[i].name} is ${repos[i].owner.login}`);
    }
  } catch (err) {
    console.log(err.message);
  }
};

async function getEvents(username) {
  let url = `https://api.github.com/users/${username}/events/public`
  console.log(`Getting events for user ${username}...`)
  try {
    let response = await fetch(url);
    let events = await response.json();
    console.log(`Found ${events.length} events.`);
    for (let i = 0; i < events.length; i++) {
      console.log(events[i]);
    }
  } catch (err) {
    console.log(err.message);
  }
}

// getRepos('test');
getEvents('manafount');
