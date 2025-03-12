import { number, Schema } from "zod";
import { connectDB, disconnectDB} from "./database";
import { mongo } from "mongoose";
import express, {Express, Request, Response} from "express"
const mongoose = require('mongoose');
const app = express();
const path = require('path')
// DO NOT CHANGE THIS URL

connectDB()

app.use(express.static(path.join(__dirname, '../react-app/frontend')))

/*
mongoose.connect('mongodb+srv://shared_user:adDk4wkyBvIv5X4p@bills.jtyzd.mongodb.net/?retryWrites=true&w=majority&appName=Bills')
    .then(() => {
        console.log("Connected to db!")
    })
    .catch((error: any) => {
        console.log("error",error)
    });
*/

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

const Chore = mongoose.model('Chore', choresSchema);
const Issue = mongoose.model('Issue', issuesSchema);
const Rota = mongoose.model('Rota', rotaSchema);

app.use(express.urlencoded({extended: true}))

app.get('/chores', async (req: Request, res: Response) => {
    const chores = await Chore.find({})
    res.render('chores/show', {chores})
})

app.get('/chores/new', (req: Request, res: Response) => {
    res.render('chores/new')
})

app.post('/chores', async(req: Request, res: Response) => {
    const newChore = new Chore(req.body);
    await newChore.save();
    res.redirect('chores/show')
})