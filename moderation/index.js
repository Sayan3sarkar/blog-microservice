const express = require("express");
const cors = require("cors");
const { default: axios } = require("axios");

const app = express();

app.use(express.json());

app.use(cors());

const statusEnum = {
  approved: "approved",
  rejected: "rejected",
};

const eventTypeEnum = {
  commentCreated: "CommentCreated",
  commentModerated: "CommentModerated",
};

const eventBusUrl = "http://event-bus-svc:4005/events";
const port = 4003;

app.post("/events", async (req, res) => {
  let { type, data: eventData } = req.body;
  eventData = typeof eventData === "string" ? JSON.parse(eventData) : eventData;

  console.log(eventData, "moderation service");

  if (type === eventTypeEnum.commentCreated) {
    const status = eventData.content.includes("orange")
      ? statusEnum.rejected
      : statusEnum.approved;

    try {
      await axios.post(eventBusUrl, {
        type: eventTypeEnum.commentModerated,
        data: JSON.stringify({
          id: eventData.id,
          postId: eventData.postId,
          content: eventData.content,
          status,
        }),
      });

      res.send("OK");
    } catch (err) {
      const errMsg = `Error while emitting ${eventTypeEnum.commentModerated} event from moderation service: ${err}`;
      console.log(errMsg);

      res.status(500).send({
        status: "failed",
        message: errMsg,
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Moderation Service running on port ${port}`);
});
