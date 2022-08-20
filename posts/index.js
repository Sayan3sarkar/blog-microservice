const express = require("express");
const cors = require("cors");
const { default: axios } = require("axios");

const { randomBytes } = require("crypto");

const app = express();

app.use(cors());

app.use(express.json());

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

const eventBusUrl = "http://localhost:4005/events";
const eventTypeEnum = {
  postCreated: "PostCreated",
};

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
  } catch (err) {
    console.log("Error emitting event to event bus from posts service", err);
  }

  res.status(201).send(posts[id]);
});

app.post("/events", (req, res) => {
  console.log("Received event in posts service", req.body.type);

  res.send();
});

app.listen(4000, () => {
  console.log("Posts Service running on 4000");
});
