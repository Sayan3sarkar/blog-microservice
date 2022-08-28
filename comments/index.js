const express = require("express");
const cors = require("cors");
const { randomBytes } = require("crypto");
const { default: axios } = require("axios");

const app = express();

app.use(express.json());
app.use(cors());

/**
 * commentsByPostId = {
 *  <postId>: [
 *      {
 *          id: <commentId>,
 *          content: <comment content>
 *      }
 *  ]
 * }
 */
const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  const { id: postId } = req.params;
  res.send(commentsByPostId[postId] || []);
});

const eventTypeEnum = {
  commentCreated: "CommentCreated",
  commentModerated: "CommentModerated",
  commentUpdated: "CommentUpdated",
};

const eventBusService = "event-bus-svc"; // ideally should be in a .env file
const eventBusPort = "4005"; // ideally should be in a .env file
const eventBusUrl = `http://${eventBusService}:${eventBusPort}/events`;

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;
  const { id: postId } = req.params;

  const comments = commentsByPostId[postId] || [];

  comments.push({ id: commentId, content, status: "pending" });
  commentsByPostId[postId] = comments;

  try {
    await axios.post(eventBusUrl, {
      type: eventTypeEnum.commentCreated,
      data: JSON.stringify({
        id: commentId,
        content,
        postId,
        status: "pending",
      }),
    });
  } catch (err) {
    const errMsg =
      "Error emitting events to event bus from comments service: " +
      JSON.stringify(err);
    console.log(errMsg);
  }

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  let { type, data } = req.body;
  data = typeof data === "string" ? JSON.parse(data) : data;

  console.log(type, data, "comments service");

  if (type === eventTypeEnum.commentModerated) {
    const { id: commentId, postId, status, content } = data;

    const comments = commentsByPostId[postId];
    const comment = comments.find((comment) => comment.id === commentId);
    comment.status = status;

    try {
      await axios.post(eventBusUrl, {
        type: eventTypeEnum.commentUpdated,
        data: JSON.stringify({
          id: commentId,
          status: comment.status,
          postId,
          content,
        }),
      });

      res.send("OK");
    } catch (err) {
      const errMsg = `Error while emitting ${eventTypeEnum.commentCreated} event from comments service: ${err}`;
      console.log(errMsg);
      res.status(500).send({
        status: "failed",
        message: errMsg,
      });
    }
  }
});

const port = 4001;
app.listen(port, () => {
  console.log(`Comments Service running on ${port}`);
});
