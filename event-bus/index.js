const express = require("express");
const cors = require("cors");
const { default: axios } = require("axios");

const app = express();

app.use(express.json());

app.use(cors());

const port = 4005; // event-bus port
const serviceEventUrls = {
  postsService: "http://posts-clusterip-svc:4000/events",
  commentsService: "http://comments-clusterip-svc:4001/events",
  queryService: "http://query-clusterip-svc:4002/events",
  moderationService: "http://moderation-clusterip-svc:4003/events",
};

const events = [];
app.post("/events", async (req, res) => {
  const event = req.body;
  events.push(event);

  console.log("event body in bus-service", event);
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

app.listen(port, () => {
  console.log(JSON.stringify(serviceEventUrls));
  console.log(`event bus running on ${port}`);
});
