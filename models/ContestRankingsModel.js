const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContestRankingsSchema = new Schema({
  contestID: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  ranking: {
    type: Number,
    required: true,
  },
});

const ContestRankings = mongoose.model("contest-rankings", ContestRankingsSchema);

module.exports = ContestRankings;
