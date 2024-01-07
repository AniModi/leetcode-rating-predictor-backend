const { fetchRankHelper } = require("../helpers/fetchRankHelper");


async function fetchContestData(req, res) {
  try {
    const { contestID } = req.body;

    await fetchRankHelper(contestID);


    res.json({ message : "Successfully fetched" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
}

module.exports = {
  fetchContestData,
};
