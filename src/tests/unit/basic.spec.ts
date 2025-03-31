import request from 'supertest';
import express, { Request, Response } from 'express';
import {app, Chore} from '../../chores'; // Adjust the import path if necessary
import {connectDB} from '../../database';
import {Types} from "mongoose";
import axios from "axios";
 // Assuming your app is exported from chores.ts

// Mock the Chore model
jest.mock('../../chores', () => {
    const originalModule = jest.requireActual('../../chores');
    return {
        ...originalModule,
        Chore: {
            find: jest.fn(),
        },
    };
});

describe('GET /:houseid/chores', () => {

      let seedProducts: any;

      beforeEach(() => {
          jest.clearAllMocks();

          seedProducts =
          [{
              _id: new Types.ObjectId(),
              userID: [new Types.ObjectId(), new Types.ObjectId()],
              houseID: "house1",
              description: "blah blah blah",
              deadline: new Date('2025-03-29'),
              dateAssigned: new Date(),
              repeatEvery: 7,
              status: 'incomplete',
              completionAdded: null,
              verifiedCount: 0
          }]
      })

      test("Can find chores", async () => {

        jest.spyOn(Chore, "find").mockResolvedValue(seedProducts);

        jest.spyOn(app.response, "render").mockImplementation(() => {
          return app.response.end;
        });

        const response = await request(app).get('/house1/chores')
        expect(response.status).toBe(200);

      })
});

describe("To do list", () => {

  let seedProducts: any;

  beforeEach(() => {
    jest.clearAllMocks();

    seedProducts =
      [{
        _id: new Types.ObjectId("123456789abcdef123456789"),
        userID: [new Types.ObjectId("aaaabbbbccccddddeeeeffff"), new Types.ObjectId("111122223333444455556666")],
        houseID: "house1",
        description: "blah blah blah",
        deadline: new Date('2025-03-29'),
        dateAssigned: new Date(),
        repeatEvery: 7,
        status: 'incomplete',
        completionAdded: null,
        verifiedCount: 0
      }]
  })

  test("Returns all chores where some chores incomplete", async() => {

    jest.spyOn(Chore, "find").mockResolvedValue(seedProducts)
    jest.spyOn(app.response, "render").mockImplementation(() => {
      return app.response.end;
    });

    const response = await request(app).get("/house1/chores/todo/aaaabbbbccccddddeeeeffff")
    expect(response.status).toBe(200);
  })


  test("Returns nothing when no chores left", async() => {

    jest.spyOn(Chore, "find").mockResolvedValue(seedProducts)
    jest.spyOn(app.response, "render").mockImplementation(() => {
      return app.response.end;
    });

    const response = await request(app).get("/house1/chores/todo/111122223333444455556666")
    expect(response.status).toBe(200);
  })

})

describe("completed chores", () => {

  let seedProducts: any;

  beforeEach(() => {
    jest.clearAllMocks();

    seedProducts =
      [{
        _id: new Types.ObjectId("123456789abcdef123456789"),
        userID: [new Types.ObjectId("aaaabbbbccccddddeeeeffff"), new Types.ObjectId("111122223333444455556666")],
        houseID: "house1",
        description: "blah blah blah",
        deadline: new Date('2025-03-29'),
        dateAssigned: new Date(),
        repeatEvery: 7,
        status: 'complete',
        completionAdded: null,
        verifiedCount: 0
      }]
  })

  test("Returns completed chores", async() => {

    jest.spyOn(Chore, "find").mockResolvedValue(seedProducts)
    jest.spyOn(app.response, "render").mockImplementation(() => {
      return app.response.end;
    });

    const response = await request(app).get("/chores/completed")
    expect(response.status).toBe(200);

  })

  test("Find specific chore Id", async() => {
    jest.spyOn(Chore, "find").mockResolvedValue(seedProducts)
    jest.spyOn(app.response, "render").mockImplementation(() => {
      return app.response.end;
    });

    const response = await request(app).get("/chores/completed/123456789abdef123456789")
    expect(response.status).toBe(404);
  })

  test("Return nothing if id does not exist", async() => {
    jest.spyOn(Chore, "find").mockResolvedValue(new Error("Database error") as any)
    jest.spyOn(app.response, "render").mockImplementation(() => {
      return app.response.end;
    });
    const response = await request(app).get("/chores/completed/999988887777666655554444")
    expect(response.status).toBe(200);
  })

})

describe("VerifiedCount", () => {

  let new_chore: any;

  beforeEach(() => {
    jest.clearAllMocks();

    new_chore =
      [{
        _id: new Types.ObjectId("123456789abcdef123456789"),
        userID: [new Types.ObjectId("aaaabbbbccccddddeeeeffff"), new Types.ObjectId("111122223333444455556666")],
        houseID: "house1",
        description: "blah blah blah",
        deadline: new Date('2025-03-29'),
        dateAssigned: new Date(),
        repeatEvery: 7,
        status: 'complete',
        completionAdded: null,
        verifiedCount: 2
      }]
  })

  test("Validcount increments on update. chore not yet complete", async () => {

    jest.spyOn(Chore, "find").mockResolvedValue(new_chore)
    jest.spyOn(Chore, "findByIdAndUpdate").mockImplementation((id: Types.ObjectId, params:any) => {
      if (params.status === "incomplete"){
        return Promise.resolve(null)
      }
      else if (params.status === "complete"){
        return Promise.resolve(null)
      }
    })
    jest.spyOn(app.response, "render").mockImplementation(() => {
      return app.response.end;
    });
    jest.spyOn(axios, "post").mockImplementation(async (url:string, item:any) => {

      if (url === "http://notifications-service:POST/notify"){
        return null; // just post notification, we don't rly care
      }
      else if(url === "http://users-service/get-all-users-in-house/house1"){
        let strArray:Array<string> = ["user1,user2,user3,user4"];
        return strArray
      }
    })

    const response = await request(app).put("/aaaabbbbccccddddeeeeffff/house1/chores/completed/123456789abcdef123456789")
    expect(response.status).toBe(302);
    expect(Chore.findOneAndUpdate)
  })

})