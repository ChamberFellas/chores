import { number, Schema } from "zod";
import { connectDB, disconnectDB} from "./database";
import mongoose, { mongo } from "mongoose";
import express, {Express, Request, Response} from "express";
import axios from "axios";
// I have tried importing method override but I keep getting errors
const methodOverride = require("method-override");
const app = express();
// DO NOT CHANGE THIS URL

connectDB()

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
    repeatEvery: {
        type: Number,
        required: false,
        min: 0,
        default: 0
    },
    dateAssigned: {
        type: Date,
        required: false,
        default: new Date()
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
        required: false,
        default: null
    },
    verifiedCount:{
        type: Number,
        required: false,
        default: 0
    }
});

const issuesSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    choreID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'chores' }],
    userID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    comment: String,
    anonymous: Boolean
})

const rotaSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    choreID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'chores' }],
    userID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    rank: Number
})

// Create documents

const Chore = mongoose.model('Chore', choresSchema);
const Issue = mongoose.model('Issue', issuesSchema);
const Rota = mongoose.model('Rota', rotaSchema);

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

// Get all chores

app.get('/chores', async (req: Request, res: Response) => {
    const chores = await Chore.find({})
    res.render('chores/index', {chores})
})

// Get all chores that the current user needs to do

app.get('/chores/todo/:id', async(req: Request, res: Response) => {
    const {userid} = req.params;
    const todo = Chore.find({'status': 'incomplete', 'userID': userid})
    res.render('chores/index', {todo})
})

// Get all chores that everyone in a household has completed

app.get('/chores/completed', async(req: Request, res: Response) => {
    const completed = Chore.find({'status': 'complete', 'completionAdded' : {$gte: new Date()}})
    res.render('chores/index', {completed})
})

// Get a specific chore from the completed page

app.get('/chores/completed/:id', async(req: Request, res: Response) => {
    const {id} = req.params;
    const completedChore = await Chore.findById(id);
    res.render('chores/index', {completedChore})
})

// Other users can contest whether a chore was completed or not

app.get('/chores/completed/:id/confirmation', async(req: Request, res: Response) => {
    const {id} = req.params;
    const completedChore = await Chore.findById(id);
    res.render('chores/index', {completedChore})
})

// Updates VerifiedCount depending on whether user confirms or rejects task completion

app.put('/chores/completed/:id', async(req: Request, res: Response) => {
    const {id} = req.params;
    const data = req.body;
    if (data.confirm === "True") {
        const chore = await Chore.findByIdAndUpdate(id, {$inc: {verifiedCount: 1}})
    } else if (data.confirm === "False") {
        const chore = await Chore.findByIdAndUpdate(id, {$inc: {verifiedCount: -1}})
    }

    const verified = await Chore.findById(id).get("verifiedCount")
    if (verified < 0){
        const chore = await Chore.findByIdAndUpdate(id, {"status": "incomplete"});
        await axios.post('http://notifications-service:POST/notify', chore);
    } else {
        const chore = await Chore.findByIdAndUpdate(id, {"status": "complete"});
    }
    res.redirect('/chores/completed')
})

// User can create a new chore on this page

app.get('/chores/new', (req: Request, res: Response) => {
    res.render('chores/new');
})

// New chore is posted to the database

app.post('/chores', async(req: Request, res: Response) => {
    const newChore = new Chore(req.body);
    await newChore.save();
    // Replace the link with the actual url
    await axios.post('http://notifications-service:POST/notify', newChore);
    res.redirect('/chores');
})

// Gets a specific chore from the todo list

app.get('/chores/:id', async (req: Request, res: Response) => {
    const {id} = req.params;
    const chore = await Chore.findById(id);
    res.render('chores/show', {chore});
})

// Route for user to edit specific chore from the todo list/mark chore as completed

app.get('/chores/:id/edit', async (req: Request, res: Response) => {
    const {id} = req.params;
    const chore = await Chore.findById(id);
    res.render('chores/edit', {chore});
})

// Deletes a chore from the database

app.delete('/chores/:id', async(req: Request, res: Response) => {
    const {id} = req.params;
    const deletedChore = await Chore.findByIdAndDelete(id);
    res.redirect('/chores');
})

// Updates a chore in the database

app.put('/chores/todo/:id', async (req: Request, res: Response) => {
    const {id} = req.params;
    const data = req.body;
    const chore = await Chore.findByIdAndUpdate(id, req.body, {runValidators: true, new: true});
    if (data.status === "complete") {
        const contestPeriod = new Date();
        contestPeriod.setDate(contestPeriod.getDate() + 1);
        const chore = await Chore.findByIdAndUpdate(id, {completionAdded: contestPeriod}, {runValidators: true, new: true})
    }
    await axios.post('http://notifications-service:POST/notify', chore);
    res.redirect('/chores');
})