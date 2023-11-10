import mongoose from "mongoose";

import { app } from "./app";

const start = async () => {
  if (!process.env.JWT_KEY) {
    process.env.JWT_KEY = "khoGusher";
  }
  if (!process.env.MONGO_URI) {
    process.env.MONGO_URI = "mongodb://auth-mongo-srv:27017/auth";
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Mongo DB..");
  } catch (err) {
    console.error(err);
  }

  app.get("/", async (req, res) => {
    res.status(200).send("Hi");
  });

  app.listen(3000, () => {
    console.log("Listening on port 3000");
  });
};

start();
