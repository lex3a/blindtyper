import { useState, useEffect, useRef } from "react";
import { InfoHeader } from "./components/InfoHeader";
import { Quote } from "./components/Quote";
import "./App.css";
import { currentTime, getDurationInMinutes } from "./utils/time";

function App() {
  const [quote, setQuote] = useState("");
  const [wpm, setWpm] = useState(0);
  const [cpm, setCpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isLoading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  // const [typedChars, setTypedChars] = useState("");
  const [currentChar, setCurrentChar] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [outgoingChars, setOutgoingChars] = useState("");
  const [isCorrectChar, setCorrectChar] = useState(true);
  const intervalId = useRef<number>();

  useEffect(() => {
    async function getData(url: string) {
      const response = await fetch(url);
      const [data] = await response.json();

      initQuoteStates(data);
      setLoading(false);
    }
    getData("https://baconipsum.com/api/?type=meat-and-filler&paras=1");
  }, []);

  useEffect(() => {
    intervalId.current = setInterval(() => {
      if (startTime) {
        const durationInMinutes = getDurationInMinutes(startTime);
        const newCpm = calculateCpm(outgoingChars.length, durationInMinutes);
        const newWpm = calculateWpm(wordCount, durationInMinutes);
        setCpm(newCpm);
        setWpm(newWpm);
      }
    }, 200);

    return () => {
      clearInterval(intervalId.current);
    };
  });

  const handleBlur = (event: React.FocusEvent<HTMLInputElement, Element>) => {
    event.target.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab") {
      event.preventDefault();
    }

    let updatedOutgoingChars = outgoingChars;

    initStartTime();

    if (event.key.length === 1) {
      if (event.key === currentChar) {
        setCurrentChar(text.charAt(0));
        setText(text.substring(1));
        updatedOutgoingChars += currentChar;
        setOutgoingChars(updatedOutgoingChars);
        setCorrectChar(true);
        const durationInMinutes = getDurationInMinutes(startTime);
        const newCpm = calculateCpm(updatedOutgoingChars.length, durationInMinutes);
        setCpm(newCpm);

        if (text.charAt(0) === " ") {
          const durationInMinutes = getDurationInMinutes(startTime);
          const newWordCount = wordCount + 1;
          const newWpm = calculateWpm(newWordCount, durationInMinutes);
          setWpm(newWpm);
          setWordCount(newWordCount);
        }
      } else {
        setCorrectChar(false);
        const newAccuracy = calculateAccuracy(updatedOutgoingChars, quote);
        setAccuracy(newAccuracy);
      }
    }
  };

  const initStartTime = () => {
    if (!startTime) {
      setStartTime(currentTime());
    }
  };

  const isFinished = () => {
    const finished = outgoingChars.length === quote.length;
    if (finished) {
      clearInterval(intervalId.current);
    }
    return finished;
  };

  const initQuoteStates = (quote: string) => {
    // We need this because API is strange and places two spaces
    // after the end of the sentence.
    const newQuote = quote.replace(/\s{2}/g, " ");
    setQuote(newQuote);
    setCurrentChar(newQuote.charAt(0));
    setText(newQuote.substring(1));
  };

  const calculateWpm = (wordCount: number, durationInMinutes: number) => {
    return Math.round(wordCount / durationInMinutes);
  };

  const calculateCpm = (charCount: number, durationInMinutes: number) => {
    return Math.round(charCount / durationInMinutes);
  };

  const calculateAccuracy = (outgoingChars: string, originalText: string) => {
    let correctChars = 0;
    for (let i = 0; i < originalText.length; i++) {
      if (outgoingChars[i] && outgoingChars[i] === originalText[0][i]) {
        correctChars++;
      }
    }
    const accuracy = Math.round((correctChars / quote.length) * 100);

    console.log(`${accuracy}% ${(correctChars / quote.length) * 100}`);

    return accuracy;
  };

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex">
          <input
            type="text"
            name="hiddenType"
            id="hiddenType"
            autoFocus
            autoComplete="off"
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
          {isFinished() ? (
            <div>
              <p>You nailed it! Literally :D</p>
              <InfoHeader cpm={cpm} wpm={wpm} accuracy={accuracy} />
            </div>
          ) : (
            <>
              <Quote text={text} char={currentChar} outgoingChars={outgoingChars} isCorrectChar={isCorrectChar}></Quote>
              <InfoHeader cpm={cpm} wpm={wpm} accuracy={accuracy} />
            </>
          )}
        </div>
      )}
    </>
  );
}

export default App;
