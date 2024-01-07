const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        default: 1500.0,
      },
      contestsCount: {
        type: Number,
        default: 0,
      },
});

module.exports = User = mongoose.model("user", UserSchema);
