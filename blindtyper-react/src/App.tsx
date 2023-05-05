import { useState, useEffect, useRef, useCallback } from "react";
import { InfoHeader } from "./components/InfoHeader";
import { Quote } from "./components/Quote";
import { currentTime, getDurationInMinutes } from "./utils/time";
import "./App.css";

const DEFAULT_ACCURACY = 100;
const API_URL = "https://baconipsum.com/api/?type=meat-and-filler&paras=1";

function App() {
  const [quote, setQuote] = useState("");
  const [wpm, setWpm] = useState(0);
  const [cpm, setCpm] = useState(0);
  const [accuracy, setAccuracy] = useState(DEFAULT_ACCURACY);
  const [isLoading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [currentChar, setCurrentChar] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [outgoingChars, setOutgoingChars] = useState("");
  const [isCorrectChar, setCorrectChar] = useState(true);
  const [errorChars, setErrorChars] = useState(0);
  const intervalId = useRef<number>();

  const initQuoteStates = useCallback((quote: string) => {
    /*     
      We need this because API is strange and places two spaces
      after the end of the sentence. 
    */
    const newQuote = quote.replace(/\s{2}/g, " ");
    setQuote(newQuote);
    setCurrentChar(newQuote.charAt(0));
    setText(newQuote.substring(1));
  }, []);

  const getQuoteData = useCallback(async () => {
    const response = await fetch(API_URL);
    const [data] = await response.json();
    initQuoteStates(data);
    setLoading(false);
  }, [initQuoteStates]);

  useEffect(() => {
    getQuoteData();
  }, [getQuoteData]);

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

  const reset = useCallback(() => {
    setLoading(true);
    getQuoteData();
    setWpm(0);
    setCpm(0);
    setAccuracy(DEFAULT_ACCURACY);
    setText("");
    setWordCount(0);
    setCurrentChar("");
    setStartTime(0);
    setOutgoingChars("");
    setCorrectChar(true);
    setErrorChars(0);
  }, [getQuoteData]);

  const calculateWpm = useCallback((wordCount: number, durationInMinutes: number) => {
    return Math.round(wordCount / durationInMinutes);
  }, []);

  const calculateCpm = useCallback((charCount: number, durationInMinutes: number) => {
    return Math.round(charCount / durationInMinutes);
  }, []);

  const calculateAccuracy = useCallback((errorChars: number, originalText: string) => {
    return Math.max((1000 - Math.round((1000 * errorChars) / originalText.length)) / 10, 0);
  }, []);

  const initStartTime = useCallback(() => {
    if (!startTime) {
      setStartTime(currentTime());
    }
  }, [startTime]);

  const isFinished = () => {
    const finished = outgoingChars.length === quote.length;

    if (finished) {
      clearInterval(intervalId.current);
    }

    return finished;
  };

  const handleBlur = useCallback(({ target }: React.FocusEvent<HTMLInputElement, Element>) => {
    target.focus();
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const { key } = event;

      if (key === "Tab") {
        event.preventDefault();
      }

      let updatedOutgoingChars = outgoingChars;

      initStartTime();

      if (key.length === 1) {
        if (key === currentChar) {
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
          if (!isCorrectChar) return; // exit if last try was already incorrect

          const newError = errorChars + 1;
          const newAccuracy = calculateAccuracy(newError, quote);
          setCorrectChar(false);
          setAccuracy(newAccuracy);
          setErrorChars(newError);
        }
      }
    },
    [
      calculateAccuracy,
      calculateCpm,
      calculateWpm,
      currentChar,
      errorChars,
      initStartTime,
      isCorrectChar,
      outgoingChars,
      quote,
      startTime,
      text,
      wordCount,
    ]
  );

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
              <button onClick={reset}>Reset</button>
            </div>
          ) : (
            <>
              <Quote text={text} char={currentChar} outgoingChars={outgoingChars} isCorrectChar={isCorrectChar}></Quote>
              <InfoHeader cpm={cpm} wpm={wpm} accuracy={accuracy} />
              <button onClick={reset}>Reset</button>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default App;
