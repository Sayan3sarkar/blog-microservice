const express = require("express");
const cors = require("cors");
const { default: axios } = require("axios");

const { randomBytes } = require("crypto");

const app = express();

app.use(cors());

app.use(express.json());

const port = 4000; // posts-service-port
const eventBusService = "event-bus-svc"; // ideally should be in a .env file
const eventBusPort = "4005"; // ideally should be in a .env file
const eventBusUrl = `http://${eventBusService}:${eventBusPort}/events`;

const eventTypeEnum = {
  postCreated: "PostCreated",
};

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/posts", async (req, res) => {
  const id = randomBytes(4).toString("hex");
  const { title } = req.body;

  posts[id] = { id, title };

  try {
    await axios.post(eventBusUrl, {
      type: eventTypeEnum.postCreated,
      data: JSON.stringify({
        id,
        title,
      }),
    });
    res.status(201).send(posts[id]);
  } catch (err) {
    console.log("Error emitting event to event bus from posts service", err);
    res.status(500).send("Error");
  }
});

app.post("/events", (req, res) => {
  console.log("Received event in posts service", req.body.type);

  res.send();
});

app.listen(port, () => {
  console.log("change in posts service: v1");
  console.log(`Posts Service running on ${port}`);
});
