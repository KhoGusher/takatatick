import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";

const start = async () => {
  if (!process.env.MONGO_URI) {
    process.env.MONGO_URI = "mongodb://payments-mongo-srv:27017/payments";
  }

  if (!process.env.JWT_KEY) {
    process.env.JWT_KEY = "khoGusher";
  }
  if (!process.env.NATS_CLIENT_ID) {
    process.env.NATS_CLIENT_ID = "ticketing";
  }
  if (!process.env.NATS_URL) {
    process.env.NATS_URL = "http://nats-srv:4222";
  }
  if (!process.env.NATS_CLUSTER_ID) {
    process.env.NATS_CLUSTER_ID = "idkhoGusherss";
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed!");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDb");
    console.log("Connected to MongoDb");
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000!!!!!!!!");
  });
};

start();
