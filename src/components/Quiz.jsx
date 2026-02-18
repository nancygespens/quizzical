import { useState, useEffect } from "react";
import { decode } from "he";
import { clsx } from "clsx";

export default function Quiz(props) {
  const NUMBER_OF_QUESTIONS = 5;

  const [questions, setQuestions] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [error, setError] = useState("");
  const [fetchKey, setFetchKey] = useState(0);

  const hasQuestions = questions.length > 0;
  const hasError = error.length !== 0;
  const allAnswered =
    hasQuestions && questions.every((q) => q.selectedAnswerIndex !== -1);
  const correctAnswers = getNumberOfCorrectAnswers();
  const allCorrect = hasQuestions && correctAnswers === NUMBER_OF_QUESTIONS;

  useEffect(() => {
    setQuestions([]);
    setIsGameOver(false);
    setError("");

    fetch(buildApiUrl())
      .then((response) => {
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error(
              "Whoa! Looks like you've triggered requests too fast!\nPlease wait a moment and try again. 😊",
            );
          }
          throw new Error(
            `Something went wrong (error status: ${response.status}).\nPlease try again later.`,
          );
        }
        return response.json();
      })
      .then((data) => {
        const updatedQuestions = data.results.map((question) => {
          const allAnswers = [...question.incorrect_answers];
          const randomIndex = Math.floor(
            Math.random() * (allAnswers.length + 1),
          );
          allAnswers.splice(randomIndex, 0, question.correct_answer);
          return {
            ...question,
            allAnswers,
            selectedAnswerIndex: -1,
          };
        });
        setQuestions(updatedQuestions);
      })
      .catch((err) => {
        setError(err);
        console.error("Fetch error:", err);
      });
  }, [fetchKey]);

  useEffect(() => {
    if (isGameOver) {
      props.setIsWon(allCorrect);
    }
  }, [isGameOver, allCorrect]);

  function buildApiUrl() {
    const category = props.custom.category
      ? `&category=${props.custom.category}`
      : "";
    const difficulty = props.custom.difficulty
      ? `&difficulty=${props.custom.difficulty}`
      : "";
    return `https://opentdb.com/api.php?amount=${NUMBER_OF_QUESTIONS}${category}${difficulty}&type=multiple`;
  }

  function getNumberOfCorrectAnswers() {
    let count = 0;
    questions.forEach((question) => {
      const answered = question.selectedAnswerIndex !== -1;
      const correct =
        question.allAnswers[question.selectedAnswerIndex] ===
        question.correct_answer;
      if (answered && correct) count++;
    });
    return count;
  }

  function selectAnswer(questionIndex, answerIndex) {
    setQuestions((prevQuestions) =>
      prevQuestions.map((question, index) => {
        if (index === questionIndex) {
          return { ...question, selectedAnswerIndex: answerIndex };
        }
        return question;
      }),
    );
  }

  function finishGame() {
    setIsGameOver(true);
    setTimeout(() => {
      const quizContainer = document.querySelector(".quizzical");
      quizContainer?.scrollTo({
        top: quizContainer.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  }

  function newGame() {
    props.setIsWon(false);
    setFetchKey((prev) => prev + 1);
  }

  function goBack() {
    props.setIsWon(false);
    props.setIsQuizStarted(false);
  }

  if (hasError) {
    return (
      <section className="error">
        <p className="error-message">{error.message}</p>
        <button onClick={goBack}>Go back</button>
      </section>
    );
  }

  if (!hasQuestions) {
    return null;
  }

  const questionElements = questions.map((question, questionIndex) => (
    <section key={questionIndex}>
      <h1>{decode(question.question)}</h1>
      <div>
        {question.allAnswers.map((answer, answerIndex) => {
          const isSelected = answerIndex === question.selectedAnswerIndex;
          const isCorrect = answer === question.correct_answer;

          const buttonClassName = clsx(
            "answer",
            isSelected && "selected",
            isGameOver && isCorrect && "correct",
            isGameOver && isSelected && !isCorrect && "incorrect",
          );

          return (
            <button
              className={buttonClassName}
              key={answerIndex}
              onClick={() => selectAnswer(questionIndex, answerIndex)}
              disabled={isGameOver && !isSelected}
            >
              {decode(answer)}
            </button>
          );
        })}
      </div>
      <hr />
    </section>
  ));

  return (
    <section className="quiz">
      {questionElements}

      <footer>
        {isGameOver && (
          <p>
            You scored {correctAnswers}/{questions.length} correct answers
            {allCorrect && "! 🎉"}
          </p>
        )}

        <div className="quiz-footer-buttons">
          <button
            onClick={isGameOver ? newGame : finishGame}
            disabled={!isGameOver && !allAnswered}
          >
            {isGameOver ? "New game" : "Check answers"}
          </button>
          <button className="btn-back" onClick={goBack}>
            🏃 Chicken out
          </button>
        </div>
      </footer>
    </section>
  );
}
