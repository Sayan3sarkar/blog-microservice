import React from "react";

const statusEnum = {
  approved: "approved",
  rejected: "rejected",
  pending: "pending",
};

function formatContent(comment) {
  let content;
  switch (comment.status) {
    case statusEnum.approved:
      content = comment.content;
      break;
    case statusEnum.pending:
      content = "This comment is awaiting moderation";
      break;
    case statusEnum.rejected:
      content = "This comment has been rejected";
      break;
    default:
      content = null;
      break;
  }
  return content;
}
const CommentList = ({ comments }) => {
  const renderedComments = comments.map((comment) => {
    return <li key={comment.id}>{formatContent(comment)}</li>;
  });

  return <ul>{renderedComments}</ul>;
};

export default CommentList;
