const ContestRankings = require("../models/ContestRankingsModel");
const User = require("../models/UserModel");

async function fetchAllUsernames(contestID) {
  try {
    const distinctUsernames = await ContestRankings.find({ contestID });
    return distinctUsernames;
  } catch (error) {
    console.error(`Error fetching usernames: ${error}`);
    return [];
  }
}

async function sortUsernamesByRanking(data) {
  return data
    .sort((a, b) => a.ranking - b.ranking)
    .map((user) => user.username);
}

async function fetchUserDataBatch(usernames) {
  return await User.find({ username: { $in: usernames } });
}

async function fetchData(sortedUsernames) {
  const batchSize = 500;
  let offset = 0;
  let allUserData = [];

  while (offset < sortedUsernames.length) {
    const batchUsernames = sortedUsernames.slice(offset, offset + batchSize);
    const userDataBatch = await fetchUserDataBatch(batchUsernames);
    const orderedUserDataBatch = batchUsernames.map((username) =>
      userDataBatch.find((user) => user.username === username)
    );

    allUserData = allUserData.concat(orderedUserDataBatch);
    offset += batchSize;
  }

  const contestCounts = allUserData.map((user) => user.contestsCount);
  const ratings = allUserData.map((user) => user.rating);

  return [contestCounts, ratings];
}

async function predictRating(req, res) {
  try {
    const { contestID } = req.body;

    const data = (await fetchAllUsernames(contestID)).map((user) => ({
      username: user.username,
      ranking: user.ranking,
    }));

    const sortedUsernames = await sortUsernamesByRanking(data);

    const response = await fetchData(sortedUsernames);
    
    for(let u = 0; u < 10; u ++) {
      console.log((getPredictedRatings(response[1], u) - response[1][u]) * f(response[0][u]));
    }


    res.json(response);
  } catch (err) {
    console.error(`Error predicting rating: ${err}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const memo = {};

function f(k) {
  function g(k) {
    if (k in memo) {
      return memo[k];
    }

    if (k >= 1) {
      const result = ((5 / 7) ** k) + g(k - 1);
      memo[k] = result;
      return result;
    }

    return 1;
  }

  if (k <= 100) {
    return 1 / (1 + g(k));
  }

  return 2 / 9;
}

function getEstimatedRating(rating, ratings) {
  const func = (a, b) => {
    const x = 1 + (10 ** ((a - b) / 400));
    return 1 / x;
  };
  let ans = 0.5;
  for (let i = 0; i < ratings.length; i++) {
    ans += func(rating, ratings[i]);
  }
  return ans;
}

function getEstimatedRank(estimatedRating, rank) {
  return Math.sqrt(rank * estimatedRating);
}

function binary_search_rating(m, ratings) {
  let estimate = m;
  let low = 0, high = 4000; // max rating will not be 4k (as of now)
  let precision = 0.01;
  let max_iterations = 25;
  while(high - low > precision && max_iterations >= 0) {
    var mid = low + (high - low) / 2;
    if(getEstimatedRating(mid, ratings) < estimate) {
      high = mid;
    }
    else {
      low = mid;
    }
    max_iterations --;
  }
  return mid;
}

function getPredictedRatings(ratings, u) {
  let er0 = getEstimatedRating(ratings[u], ratings);
  let m = getEstimatedRank(er0, u + 1);
  return binary_search_rating(m, ratings);
}

module.exports = {
  predictRating,
};
