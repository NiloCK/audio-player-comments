import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import sample from "/sample.mp3";
// import sample from '/geese.wav'
import "./App.css";
import AudioPlayer from "./Player";
import { generateComments } from "./comment";

function App() {
  const [count, setCount] = useState(0);

  const [comments, setComments] = useState(generateComments(600, 5));

  return (
    <>
      <AudioPlayer src={sample} comments={comments} />
    </>
  );
}

export default App;
