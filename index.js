const fetch = require('isomorphic-fetch');

async function commitHistory(username) {
  let url = `https://api.github.com/users/${username}/repos`

  try {
    let response = await fetch(url);
    let repos = await response.json();
    console.log(repos);
  } catch (err) {
    console.log(err.message);
  }

};
commitHistory('test');
