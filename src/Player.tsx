import { useState, useRef, useEffect } from "react";
import React from "react";

import {
  VictoryArea,
  VictoryChart,
  VictoryClipContainer,
  VictoryContainer,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
  VictoryThemeDefinition,
} from "victory";
import { EmbeddedComment, generateComments } from "./comment";
import CommentComponent from "./Comment";

interface AudioPlayerProps {
  src: string;
  comments: EmbeddedComment[];
}

interface CommentRange {
  from: number;
  to: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, comments }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [commentRange, setCommentRange] = useState<CommentRange>({
    from: 0,
    to: audioRef.current?.duration || 0,
  }); // [{from: 0, to: 10}, {from: 20, to: 30}
  const [volume, setVolume] = useState(1); // Volume range from 0.0 to 1.0

  useEffect(() => {
    const audio = audioRef.current;

    const updateCurrentTime = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);

        if (clickStart === NON_EXISTING) {
          setCommentRange({
            from: audio.currentTime - 100,
            to: audio.currentTime + 100,
          });
        }
      }
    };

    audio.addEventListener("timeupdate", updateCurrentTime);

    return () => {
      audio.removeEventListener("timeupdate", updateCurrentTime);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = e.target.value;
    audioRef.current.volume = parseFloat(newVolume);
    setVolume(parseFloat(newVolume));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    audioRef.current.currentTime = parseFloat(newTime);
  };

  const addComment = () => {
    console.log("add comment");
  };

  function toData(comments: EmbeddedComment[]) {
    return comments.map((comment) => {
      return { x: comment.parent.start, y: 2 + comment.replies.length };
    });
  }

  // const data = [
  //   { x: 0, y: 1 },
  //   // { x: audioRef.current?.duration / 2, y: 5 },
  //   { x: audioRef.current?.duration, y: 1 },
  // ];
  const data = toData(comments);

  for (let i = 0; i < audioRef.current?.duration; i++) {
    data.push({ x: i, y: 1 });
  }

  const dotData = [{ x: currentTime, y: 1, label: "You are here" }];

  let userRangeDef: CommentRange = { from: 0, to: 0 };

  const NON_EXISTING = -1;
  let clickStart = NON_EXISTING;

  return (
    <div>
      <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} />
      <button onClick={togglePlayPause}>{isPlaying ? "⏸" : "▶"}</button>
      {/* <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} /> */}
      <div>
        <input
          width="500px"
          type="range"
          min="0"
          value={currentTime || 0}
          max={audioRef.current?.duration || 0}
          step="1"
          onChange={handleSeek}
        />

        <VictoryChart
          theme={noAxis}
          events={[
            {
              target: "parent",
              eventHandlers: {
                onMouseDown: (e) => {
                  // Get the bounding rectangle of the chart
                  const boundingRect = e.currentTarget.getBoundingClientRect();

                  // Calculate click position relative to the chart
                  const left = boundingRect.left;
                  const right = boundingRect.right;
                  const width = right - left;
                  const relative = (e.clientX - left) / width;
                  const asTimeStamp = relative * audioRef.current?.duration;

                  clickStart = asTimeStamp;
                },
                onMouseUp: (e) => {
                  // Get the bounding rectangle of the chart
                  const boundingRect = e.currentTarget.getBoundingClientRect();

                  // Calculate click position relative to the chart
                  const left = boundingRect.left;
                  const right = boundingRect.right;
                  const width = right - left;
                  const relative = (e.clientX - left) / width;
                  const asTimeStamp = relative * audioRef.current?.duration;

                  if (clickStart > asTimeStamp) {
                    userRangeDef.from = asTimeStamp;
                    userRangeDef.to = clickStart;
                  } else {
                    userRangeDef.from = clickStart;
                    userRangeDef.to = asTimeStamp;
                  }

                  setCommentRange(userRangeDef);

                  console.log(relative);
                },
                onMouseOut: () => {
                  console.log("onMouseOut");
                  return [
                    {
                      target: "data",
                      mutation: () => {
                        return null;
                      },
                    },
                  ];
                },
              },
            },
          ]}
        >
          <VictoryArea
            data={[
              { x: commentRange.from, y: 2, y0: 0 },
              { x: commentRange.to, y: 2, y0: 0 },
            ]}
            style={{ data: { fill: "#eeeeee" } }} // Set the background color for the range
            groupComponent={
              <VictoryClipContainer clipPadding={{ top: 5, bottom: 5 }} />
            }
          />
          <VictoryLine
            data={[
              { x: commentRange.from, y: 0 },
              { x: commentRange.from, y: 2 },
            ]}
            style={{
              data: { stroke: "#c43a31" },
            }}
          />
          <VictoryLine
            interpolation="natural"
            data={[
              { x: commentRange.to, y: 0 },
              { x: commentRange.to, y: 2 },
            ]}
            style={{
              data: { stroke: "#c43a31" },
            }}
          />

          {/*  the line */}
          <VictoryLine
            interpolation="bundle"
            data={data}
            style={{
              data: { stroke: "#c43a31" },
            }}
          />
          <VictoryScatter
            data={dotData}
            size={5} // Adjust the size of the dot
            style={{
              data: { fill: "#c43a31" },
            }}
          />
        </VictoryChart>
      </div>
      <div>
        <CommentsList
          comments={comments.filter((comment) => {
            return (
              comment.parent.start &&
              comment.parent.start >= commentRange.from &&
              comment.parent.end <= commentRange.to
            );
          })}
        />
      </div>
    </div>
  );
};

const noAxis: VictoryThemeDefinition = {
  axis: {
    style: {
      axis: {
        stroke: "none",
      },
      tickLabels: {
        fill: "none",
      },
      grid: {
        stroke: "none",
      },
    },
  },
};

export default AudioPlayer;

interface CommentProps {
  comments: EmbeddedComment[];
}

const CommentsList: React.FC<CommentProps> = ({ comments }) => {
  return <ul>{comments.map((comment) => CommentComponent({ comment }))}</ul>;
};
