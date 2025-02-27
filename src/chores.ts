import { number } from "zod";

const mongoose = require('mongoose');

// DO NOT CHANGE THIS URL

mongoose.connect('mongodb+srv://shared_user:adDk4wkyBvIv5X4p@cluster.mongodb.net/myDatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// CREATE ALL TABLES/SCHEMAS

const choresSchema = new mongoose.Schema({
    choreID: Number,
    userID: Number,
    houseID: Number,
    description: String,
    deadline: Date,
    dateAssigned: Date,
    repeatEvery: Number,
    status: String,
    completionAdded: Date,
    verifiedCount: Date
});

const issuesSchema = new mongoose.Schema({
    issueID: Number,
    choreID: Number,
    userID: Number,
    comment: String,
    anonymous: Boolean
})

const rotaID = new mongoose.Schema({
    choreID: Number,
    userID: Number
})

