import React from "react";
import "./Comment.css"; // Assuming styles are defined in Comment.css
import EmbeddedComment from "./comment";

interface CommentProps {
  comment: EmbeddedComment;
}

const CommentComponent: React.FC<CommentProps> = ({ comment }) => {
  return (
    <div className="comment-box">
      <div>
        <span className="comment-author">{comment.author}</span>{" "}
        <span className="comment-timestamp">
          {toRelativeTimeString(comment.timestamp)}
        </span>
      </div>
      <div className="comment-content">{comment.text}</div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <CommentComponent key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
};

function toRelativeTimeString(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  if (years > 0) {
    return `${years} year${years > 1 ? "s" : ""} ago`;
  } else if (months > 0) {
    return `${months} month${months > 1 ? "s" : ""} ago`;
  } else if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (seconds > 0) {
    return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  } else {
    return "just now";
  }
}

export default CommentComponent;
