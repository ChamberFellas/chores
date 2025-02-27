import request from "supertest";
import { app } from "../../index";

describe("GET /", () => {
  it("should return 200", async () => {
    const response = await request(app).get("/status");
    expect(response.status).toBe(200);
  });
});

// Proposed tests

// ADDING CHORES (dep. NONE)

  // chore name cannot be NULL and is less than (20 chars)

  // chore desc cannot be NULL and is less than (100 chars)

  // chore deadline boundary tests 
    // deadline yesterday FAILS
    // deadline today FAILS
    // deadline tomorrow PASSES

  // person assigned to must be in the house.
  // person assigned to must not be NULL

  // if everything above applies:
    // cannot add chore if there is less than one person in the house.
    // Otherwise add chore with relevant data. 

// EDITING EXISTING CHORE (dep. ADDING)

 // changing existing chore name to NULL (FAILS)

 // changing existing chore desc to NULL (FAILS)

 // changing chore deadlines to invalid times (FAILS)

 // Cannot change person to NULL
 // cannot Change person to themselves. IE if Ayushi is assigned to a chore, you cannot edit assignee to Ayushi
 // cannot change person to someone outside the house or does not exist.

 // If all above applies 
  // Any attempt to edit a chore is rejected if person making the edit does not match person who created the chore.
  // Cannot edit a chore if there is less than one person in the house.

// DELETING A CHORE (dep. ADDING)

  // Any attempt to delete a chore rejected if person making the deletion does not match person who created/
  // Cannot delete archived chores

// MARKING A COMPLETION (dep. EDITING)

  // status must be "incomplete" before marking it as complete. FAIL if status is different
  // current date must be before the deadline.
  // completion can only be marked by the person who is assigned the chore.

  // if above is ok
    // change status of chore to "complete"
    // get list of people who will be notified. (Everyone except the person the chore is assigned to)

// APPROVING A COMPLETION (dep. MARKING A COMPLETION)

  // status mst be marked as "complete". FAIL if status is different.
  // date must be between day "completion" was raise and before 72 hours after that date. EG. if completion raised 26/02/25 , then rejection on 28/02/25 is valid, rejecton on 2/3/25 is not.
    // Make sure leap years work :)

  // If all above applies:
    // add person who approved it to database

// REJCTING A COMPLETION (dep. MARKING A COMPLETION)

  // current status must be "complete". FAIL if satus is different.
  // date must be between day "completion" was raise and before 72 hours after that date. EG. if completion raised 26/02/25 , then rejection on 28/02/25 is valid, rejecton on 2/3/25 is not.
    // Make sure leap years work :)
  
  // data in completion
    // person who made rejection must be in house
    // person who made rejection cannot be the person who is assigned to the chore.
    // reason for rejection cannot be NULL
    // reason for rejection cannot exceed 100 characters (random number idfk)
  
  // if all above applies
    // change status of chore
    // get list of people who will be notified (the person the chore is assigned to)

// CHORE ARCHIVAL (dep. MARKING A COMPLETION)

// gonna finish tmrw :)





