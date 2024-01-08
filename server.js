const express = require("express");
const mongoose = require("mongoose");

const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

function connectToMongo() {
  const db_uri = process.env.DB_URI;
  mongoose
    .connect(db_uri)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));
}

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));

connectToMongo();

const contestRoutes = require("./routes/contestRoutes");
const userRoutes = require("./routes/userRoutes");
const predictRoutes = require("./routes/predictRoutes");


app.use("/api/", contestRoutes);
app.use("/api/", userRoutes);
app.use("/api/", predictRoutes);