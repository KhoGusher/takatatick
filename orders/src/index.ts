import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
import { ExpirationCompleteListener } from "./events/listeners/expiration-complete-listener";
import { PaymentCreatedListener } from "./events/listeners/payment-created-listener";

const start = async () => {
  if (!process.env.MONGO_URI) {
    process.env.MONGO_URI = "mongodb://orders-mongo-srv:27017/orders";
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

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Mongo DB");
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000!!!!!!!!");
  });
};

start();
