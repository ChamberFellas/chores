import { Router } from "express";
import axios from "axios";
import { Chore, Issue } from "./models/chores";

const router = Router();

// Get all chores

router.get("/:houseid/chores", async (req, res) => {
  const chores = await Chore.find({ houseID: req.params });
  res.status(200).json(chores);
});

// Get all chores that the current user needs to do

router.get("/:houseid/chores/todo/:userid", async (req, res) => {
  const userid = req.params.userid;
  const houseid = req.params.houseid;
  const todo = Chore.find({
    status: "incomplete",
    userID: userid,
    houseID: houseid,
  });
  res.status(200).json(todo);
});

// Get all chores that everyone in a household has completed

router.get("/chores/completed", async (req, res) => {
  const completed = Chore.find({
    status: "complete",
    completionAdded: { $gte: new Date() },
  });
  res.status(200).json(completed);
});

// Get a specific chore from the completed page

router.get("/chores/completed/:id", async (req, res) => {
  const { id } = req.params;
  const completedChore = await Chore.findById(id);
  res.status(200).json(completedChore);
});

// Other users can contest whether a chore was completed or not

router.get("/chores/completed/:id/confirmation", async (req, res) => {
  const { id } = req.params;
  const completedChore = await Chore.findById(id);
  res.status(200).json(completedChore);
});

// Updates VerifiedCount depending on whether user confirms or rejects task completion

router.put(":userid/:houseid/chores/completed/:id", async (req, res) => {
  const id = req.params.id;
  const userid = req.params.userid;
  const data = req.body;
  if (data.confirm === "True") {
    const chore = await Chore.findByIdAndUpdate(id, {
      $inc: { verifiedCount: 1 },
    });
  } else if (data.confirm === "False") {
    const chore = await Chore.findByIdAndUpdate(id, {
      $inc: { verifiedCount: -1 },
    });
    if (data.comment) {
      const newComment = new Issue({
        choreID: id,
        userID: userid,
        comment: data.comment,
        anonymous: data.anonymous,
      });
      await newComment.save();
      await axios.post("http://notifications-service:POST/notify", newComment);
      res.status(200).json(newComment);
      return;
    }
  }

  const verified = await Chore.findById(id).get("verifiedCount");
  if (verified < 0) {
    const chore = await Chore.findByIdAndUpdate(id, { status: "incomplete" });
    await axios.post("http://notifications-service:POST/notify", chore);
  } else {
    const chore = await Chore.findByIdAndUpdate(id, { status: "complete" });
  }
  res.status(200).json({ message: "Chore status updated" });
});

// New chore is posted to the database

router.post("/:userid/:houseid/chores", async (req, res) => {
  const { description, deadline, repeatEvery, dateAssigned } = req.body;
  const userID = req.params.userid;
  const houseID = req.params.houseid;
  const newChore = new Chore({
    userID,
    houseID,
    description,
    deadline,
    repeatEvery,
    dateAssigned,
  });
  await newChore.save();
  // Replace the link with the actual url
  await axios.post("http://notifications-service:POST/notify", newChore);
  res.status(201).json({ newChore });
});

// Gets a specific chore from the todo list

router.get("/chores/:id", async (req, res) => {
  const { id } = req.params;
  const chore = await Chore.findById(id);
  if (!chore) {
    res.status(404).json({ message: "Chore not found" });
    return;
  }
  res.status(200).json({ chore });
});

// Deletes a chore from the database

router.delete("/chores/*/:id", async (req, res) => {
  const { id } = req.params;
  const deletedChore = await Chore.findByIdAndDelete(id);
  if (!deletedChore) {
    res.status(404).json({ message: "Chore not found" });
    return;
  }
  res.status(200).json({ message: "Chore deleted successfully" });
});

// Updates a chore in the database

router.put("/chores/todo/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const chore = await Chore.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });
  if (data.status === "complete") {
    const contestPeriod = new Date();
    contestPeriod.setDate(contestPeriod.getDate() + 1);
    const chore = await Chore.findByIdAndUpdate(
      id,
      { completionAdded: contestPeriod },
      { runValidators: true, new: true },
    );
    if (data.repeat != 0) {
      const userid = data.userid;
      const houseid = data.houseid;
      const description = data.description;
      const repeat = data.repeat;
      const dateAssigned = new Date();
      const deadline = new Date();
      if (data.dateAssigned === "Weekly") {
        dateAssigned.setDate(data.dateassigned + 7);
        deadline.setDate(data.deadline + 7);
      } else if (data.dateassigned === "Biweekly") {
        dateAssigned.setDate(data.dateassigned + 14);
        deadline.setDate(data.deadline + 14);
      } else if (data.dateassigned === "Monthly") {
        dateAssigned.setDate(data.dateassigned.getMonth() + 1);
        deadline.setDate(data.deadline.getMonth() + 1);
      }
      const newChore = new Chore({
        userid,
        houseid,
        description,
        deadline,
        dateAssigned,
        repeat,
      });
      await newChore.save();
      await axios.post("http://notifications-service:POST/notify", newChore);
    }
  }
  await axios.post("http://notifications-service:POST/notify", chore);
  res.status(200).json({ message: "Chore updated successfully" });
});

export default router;
