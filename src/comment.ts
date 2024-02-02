/**
 * Offset from the start of the audio file in seconds.
 *
 * if `end` is 0, then the timestamp is a point in time.
 */
type Timestamp = {
  start: number;
  end: number;
};

type CommentID = string;

export default interface EmbeddedComment {
  id: CommentID;
  author: string;
  text: string;
  timestamp: Date;

  parent: CommentID | Timestamp;
  replies: EmbeddedComment[];
}

// generates comments
export function generateComments(
  duration: number,
  n: number
): EmbeddedComment[] {
  const comments: EmbeddedComment[] = [];
  for (let i = 0; i < n; i++) {
    const start = Math.random() * duration;
    const end =
      Math.random() > 0.5 ? Math.random() * (duration - start) + start : 0;

    const thisComment: EmbeddedComment = {
      id: i.toString(),
      author: "Joe",
      text: "This is a comment",
      timestamp: randomPastDate(),
      parent: {
        start,
        end,
      },
      replies: [],
    };

    while (Math.random() > 0.9) {
      thisComment.replies.push({
        id: i.toString() + "reply",
        author: "Jane",
        text: "This is a reply",
        timestamp: new Date(
          thisComment.timestamp.getMilliseconds() +
            Math.random() * 1000 * 60 * 60 * 24
        ),
        parent: thisComment.id,
        replies: [],
      });
    }

    console.log(thisComment);
    comments.push(thisComment);
  }

  return comments;
}

function randomPastDate() {
  return new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7);
}
