import { number, Schema } from "zod";
import { connectDB, disconnectDB} from "./database";
const mongoose = require('mongoose');
const express = require('express');
const app = express();
// DO NOT CHANGE THIS URL

connectDB()

mongoose.connect('mongodb+srv://shared_user:adDk4wkyBvIv5X4p@bills.jtyzd.mongodb.net/?retryWrites=true&w=majority&appName=Bills')
    .then(() => {
        console.log("Connected to db!")
    })
    .catch((error: any) => {
        console.log("error",error)
    });

// CREATE ALL TABLES/SCHEMAS

const choresSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    houseID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'house' }],
    description:{
        type: String,
        required: false,
        maxLength: 50,
    },
    deadline: {
        type: Date,
        required: true
    },
    dateAssigned: {
        type: Date,
        required: false,
        default: new Date()
    },
    repeatEvery: {
        type: Number,
        required: false,
        min: 0,
        default: 0
    },
    status:{
        type: String,
        required: false,
        default: "incomplete",
        lowercase: true,
        enum: ['incomplete', 'complete']
    },
    completionAdded:{
        type: Date,
        required: false
    },
    verifiedCount:{
        type: Number,
        required: false,
        default: 0
    }
});

const issuesSchema = new mongoose.Schema({
    _ID: mongoose.Schema.Types.ObjectId,
    choreID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'chores' }],
    userID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    comment: String,
    anonymous: Boolean
})

const rotaSchema = new mongoose.Schema({
    _ID: mongoose.Schema.Types.ObjectId,
    choreID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'chores' }],
    userID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    rank: Number
})

