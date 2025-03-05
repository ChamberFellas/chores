import { number } from "zod";
import { connectDB, disconnectDB} from "./database";
const mongoose = require('mongoose');

// DO NOT CHANGE THIS URL

connectDB()

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

