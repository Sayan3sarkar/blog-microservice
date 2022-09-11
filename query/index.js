const express = require("express");
const cors = require("cors");
const { default: axios } = require("axios");

const app = express();

app.use(express.json());

app.use(cors());

/**
 * posts: {
 *      <post ID>: {
 *          id: <post ID>
 *          title: <post title>
 *          comments: [
 *              {id: <comment_id>, content: <comment_content>},
 *              {id: <comment_id>, content: <comment_content>}
 *          ]
 *      }
 * }
 */
const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

const eventTypeEnum = {
  commentCreated: "CommentCreated",
  commentUpdated: "CommentUpdated",
  postCreated: "PostCreated",
};

const eventBusUrl = "http://event-bus-svc:4005/events";
const port = 4002;

function handleEvent(type, data) {
  console.log("type", type, "data", data);
  if (type === eventTypeEnum.postCreated) {
    const { id: postId, title, status } = data;

    posts[postId] = {
      id: postId,
      title,
      comments: [],
    };
  } else if (type === eventTypeEnum.commentCreated) {
    const { id: commentId, content, postId, status } = data;
    const post = posts[postId];

    post.comments.push({
      id: commentId,
      content,
      status,
    });
  } else if (type === eventTypeEnum.commentUpdated) {
    const { id: commentId, content, postId, status } = data;
    const post = posts[postId];
    const comment = post.comments.find((comment) => comment.id === commentId);

    comment.status = status;
    comment.content = content;
  }
}

app.post("/events", (req, res) => {
  let { type, data } = req.body;
  data = typeof data === "string" ? JSON.parse(data) : data;

  handleEvent(type, data);

  res.send("OK");
});

app.listen(port, async () => {
  console.log(`Query service running on ${port}`);

  try {
    const { data: events } = await axios.get(eventBusUrl);

    events.forEach((event) => {
      event.data =
        typeof event.data === "string" ? JSON.parse(event.data) : data;
      console.log(event.type, event.data);
      console.log(`Processing event: ${event.type}`);
      handleEvent(event.type, event.data);
    });
  } catch (err) {
    console.log(
      `Error while fetching all events from event bus in query service: ${err}`
    );
  }
});
