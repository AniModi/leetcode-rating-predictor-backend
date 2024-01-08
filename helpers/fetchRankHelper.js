const axios = require("axios");
const ContestRankings = require("../models/ContestRankingsModel");
const baseurl = process.env.LEETCODE_HTTP_CONTEST_BASE_URL;

async function postContestData(contestID, data) {
  const bulkOps = data.map(({ username, rank }) => ({
    updateOne: {
      filter: { contestID, username },
      update: { $set: { contestID, username, ranking: rank } },
      upsert: true,
    },
  }));

  try {
    await ContestRankings.bulkWrite(bulkOps);
  } catch (err) {
    throw {
      message: "Error fetching ranks",
      error: err,
    };
  }
}

async function fetchNextPage(url, page, contestID) {
  const contest_data = [];
  let result = await axios.get(url + `?pagination=${page}`);
  let data = result.data;
  let ranks = data.total_rank;

  for (let i = 0; i < ranks.length; i++) {
    if(ranks[i].score === 0) {
      continue;
    }
    contest_data.push({
      username: ranks[i].username,
      rank: ranks[i].rank,
    });
  }
  await postContestData(contestID, contest_data);
}

async function handleFetch(url, total_pages, ranks, contestID) {
  const contest_data = [];
  for (let i = 0; i < ranks.length; i++) {
    contest_data.push({
      username: ranks[i].username,
      rank: ranks[i].rank,
    });
  }
  await postContestData(contestID, contest_data);
  const promises = [];
  for (let page = 2; page <= total_pages; page++) {
    promises.push(fetchNextPage(url, page, contestID));
  }

  await Promise.all(promises);
}

async function fetchRankHelper(contestID) {
  try {
    const url = baseurl + `ranking/${contestID}/`;
    let result = await axios.get(url);

    let data = result.data;
    let user_num = data.user_num;

    const total_pages = Math.ceil(user_num / 25.0);
    let ranks = data.total_rank;

    const contest_data = [];

    await handleFetch(url, total_pages, ranks, contestID);

    return contest_data;
  } catch (err) {
    throw {
      message: "Error fetching ranks",
      error: err,
    };
  }
}

module.exports = {
  fetchRankHelper,
};
