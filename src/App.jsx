import { useState } from "react";
import { useWindowSize } from "react-use";
import { clsx } from "clsx";
import Title from "./components/Title.jsx";
import Quiz from "./components/Quiz.jsx";
import Confetti from "react-confetti";

export default function App() {
  const { width, height } = useWindowSize();

  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [custom, setCustom] = useState({
    category: "",
    difficulty: "",
  });

  return (
    <main className="app">
      {isWon && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={1000}
          recycle={false}
          gravity={1.5}
        />
      )}

      <div className="quizzical-container">
        <img
          src="../src/images/1.png"
          className="character character-left"
          alt="Left character"
        />
        <img
          src="../src/images/2.png"
          className="character character-right"
          alt="Right character"
        />

        <div className={clsx("quizzical", isQuizStarted ? "" : "title-screen")}>
          {isQuizStarted ? (
            <Quiz
              setIsQuizStarted={setIsQuizStarted}
              isWon={isWon}
              setIsWon={setIsWon}
              custom={custom}
            />
          ) : (
            <Title
              setIsQuizStarted={setIsQuizStarted}
              custom={custom}
              setCustom={setCustom}
            />
          )}
        </div>
      </div>
    </main>
  );
}
