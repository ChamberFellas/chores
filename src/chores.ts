import { number, Schema } from "zod";
import { connectDB, disconnectDB} from "./database";
import mongoose, { mongo, Types } from "mongoose";
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

app.get('/:houseid/chores', async (req: Request, res: Response) => {

    const chores = await Chore.find({houseID: req.params})
    res.render('chores/index', {chores})
})

// Get all chores that the current user needs to do

app.get('/:houseid/chores/todo/:userid', async(req: Request, res: Response) => {
    const userid = req.params.userid;
    const houseid = req.params.houseid;
    const todo = Chore.find({'status': 'incomplete', 'userID': userid, 'houseID': houseid})
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

app.put(':userid/:houseid/chores/completed/:id', async(req: Request, res: Response) => {
    const id = req.params.id;
    const userid = req.params.userid;
    const data = req.body;
    if (data.confirm === "True") {
        const chore = await Chore.findByIdAndUpdate(id, {$inc: {verifiedCount: 1}})
    } else if (data.confirm === "False") {
        const chore = await Chore.findByIdAndUpdate(id, {$inc: {verifiedCount: -1}})
        if (data.comment) {
            const newComment = new Issue({choreID: id, userID: userid, comment: data.comment, anonymous: data.anonymous})
            await newComment.save();
            await axios.post('http://notifications-service:POST/notify', newComment);
            res.redirect("/chores/completed")
        }
    }

    const verified = await Chore.findById(id).get("verifiedCount")
    if (verified < 0){
        const chore = await Chore.findByIdAndUpdate(id, {"status": "incomplete"});
        await axios.post('http://notifications-service:POST/notify', chore);
    } else {
        const chore = await Chore.findByIdAndUpdate(id, {"status": "complete"});
    }
    res.redirect('/chores/completed/:id/')
})

// User can create a new chore on this page

app.get('/chores/new', (req: Request, res: Response) => {
    res.render('chores/new');
})

// New chore is posted to the database

app.post('/:userid/:houseid/chores', async(req: Request, res: Response) => {
    const {description, deadline, repeatEvery, dateAssigned} = req.body;
    const userID = req.params.userid;
    const houseID = req.params.houseid;
    const newChore = new Chore({userID, houseID, description, deadline, repeatEvery, dateAssigned});
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

app.get('/chores/todo/:id/edit', async (req: Request, res: Response) => {
    const {id} = req.params;
    const chore = await Chore.findById(id);
    res.render('chores/edit', {chore});
})

// Deletes a chore from the database

app.delete('/chores/*/:id', async(req: Request, res: Response) => {
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
        if (data.repeat != 0) {
            const userid = data.userid;
            const houseid = data.houseid;
            const description = data.description;
            const repeat = data.repeat;
            const dateAssigned = new Date();
            dateAssigned.setDate(data.dateassigned + repeat);
            const deadline = new Date();
            deadline.setDate(data.deadline + repeat);
            const newChore = new Chore({userid, houseid, description, deadline, dateAssigned, repeat})
            await newChore.save();
            await axios.post('http://notifications-service:POST/notify', newChore);
        }
    }
    await axios.post('http://notifications-service:POST/notify', chore);
    res.redirect('/chores');
})

/*
const test123 = async () => {
    const seedProducts =
    {
        _id: new Types.ObjectId(),
        userID: [new Types.ObjectId(), new Types.ObjectId()],
        houseID: [new Types.ObjectId()],
        description: "blah blah blah",
        deadline: new Date('2025-03-29'),
        dateAssigned: new Date(),
        repeatEvery: 7,
        status: 'incomplete',
        completionAdded: null,
        verifiedCount: 0
    }
    try {
        console.log(seedProducts)
        const response = await axios.post('http://172.26.92.10:3000/chores', seedProducts);
        console.log('Response:', response.data);
    } catch (error: any) {
        console.error('Error:', error.response?.data || error.message);
    }
}

test123();
*/