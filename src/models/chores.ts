import mongoose from "mongoose";

const choresSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userID: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  houseID: [{ type: mongoose.Schema.Types.ObjectId, ref: "house" }],
  description: {
    type: String,
    required: false,
    maxLength: 50,
  },
  deadline: {
    type: Date,
    required: true,
  },
  repeatEvery: {
    type: Number,
    required: false,
    min: 0,
    default: 0,
  },
  dateAssigned: {
    type: Date,
    required: false,
    default: new Date(),
  },
  status: {
    type: String,
    required: false,
    default: "incomplete",
    lowercase: true,
    enum: ["incomplete", "complete"],
  },
  completionAdded: {
    type: Date,
    required: false,
    default: null,
  },
  verifiedCount: {
    type: Number,
    required: false,
    default: 0,
  },
});

const issuesSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  choreID: [{ type: mongoose.Schema.Types.ObjectId, ref: "chores" }],
  userID: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  comment: String,
  anonymous: Boolean,
});

const rotaSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  choreID: [{ type: mongoose.Schema.Types.ObjectId, ref: "chores" }],
  userID: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  rank: Number,
});

// Create documents

const Chore = mongoose.model("Chore", choresSchema);
const Issue = mongoose.model("Issue", issuesSchema);
const Rota = mongoose.model("Rota", rotaSchema);

export { Chore, Issue, Rota };
