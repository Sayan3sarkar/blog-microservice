const express = require("express");
const cors = require("cors");
const { default: axios } = require("axios");

const app = express();

app.use(express.json());

app.use(cors());

const serviceEventUrls = {
  postsService: "http://localhost:4000/events",
  commentsService: "http://localhost:4001/events",
  queryService: "http://localhost:4002/events",
  moderationService: "http://localhost:4003/events",
};

const events = [];
app.post("/events", async (req, res) => {
  const event = req.body;
  events.push(event);
  try {
    const promises = [
      axios.post(serviceEventUrls.postsService, event),
      axios.post(serviceEventUrls.commentsService, event),
      axios.post(serviceEventUrls.queryService, event),
      axios.post(serviceEventUrls.moderationService, event),
    ];

    await Promise.all(promises);

    res.send({
      status: "OK",
    });
  } catch (err) {
    console.log("Error in emitting events from event bus", err);
    res.status(500).send({
      status: "failed",
    });
  }
});

app.get("/events", (req, res) => {
  res.send(events);
});

app.listen(4005, () => {
  console.log("event bus running on 4005");
});
