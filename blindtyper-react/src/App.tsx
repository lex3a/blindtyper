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
  const [fetchError, setFetchError] = useState("");
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
    try {
      const response = await fetch(API_URL);
      const [data] = await response.json();
      initQuoteStates(data);
      setLoading(false);
    } catch (error) {
      setFetchError(`An error fetching quote. ${error}`);
    }
  }, [initQuoteStates]);

  useEffect(() => {
    getQuoteData();
  }, [getQuoteData]);

  useEffect(() => {
    intervalId.current = setInterval(updateCpmAndWpm, 200);

    return () => {
      clearInterval(intervalId.current);
    };
  });

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

  const updateCpmAndWpm = useCallback(() => {
    if (startTime) {
      const durationInMinutes = getDurationInMinutes(startTime);
      const newCpm = calculateCpm(outgoingChars.length, durationInMinutes);
      const newWpm = calculateWpm(wordCount, durationInMinutes);
      setCpm(newCpm);
      setWpm(newWpm);
    }
  }, [calculateCpm, calculateWpm, outgoingChars.length, startTime, wordCount]);

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

  // Return the focus on our hidden input if we lost it
  const handleBlur = useCallback(({ target }: React.FocusEvent<HTMLInputElement, Element>) => {
    target.focus();
  }, []);

  // Hack for FireFox to disable a Tab key
  useEffect(() => {
    function disableTabKey(this: Window, event: KeyboardEvent) {
      const { key } = event;
      if (key === "Tab") {
        event.preventDefault();
      }
    }

    window.addEventListener("keydown", disableTabKey);

    return () => {
      window.removeEventListener("keydown", disableTabKey);
    };
  });

  const handleErrorChar = useCallback(() => {
    if (!isCorrectChar) return; // exit if last try was already incorrect

    const newError = errorChars + 1;
    const newAccuracy = calculateAccuracy(newError, quote);

    setCorrectChar(false);
    setAccuracy(newAccuracy);
    setErrorChars(newError);
  }, [calculateAccuracy, errorChars, isCorrectChar, quote]);

  const handleNewChar = useCallback(
    (durationInMinutes: number) => {
      let updatedOutgoingChars = outgoingChars;
      updatedOutgoingChars += currentChar;
      setOutgoingChars(updatedOutgoingChars);
      setCurrentChar(text.charAt(0));
      setText(text.substring(1));
      setCorrectChar(true);

      const newCpm = calculateCpm(updatedOutgoingChars.length, durationInMinutes);
      setCpm(newCpm);
    },
    [calculateCpm, currentChar, outgoingChars, text]
  );

  const handleNewWord = useCallback(
    (durationInMinutes: number) => {
      const newWordCount = wordCount + 1;
      const newWpm = calculateWpm(newWordCount, durationInMinutes);
      setWordCount(newWordCount);
      setWpm(newWpm);
    },
    [calculateWpm, wordCount]
  );

  const handleKeyDown = useCallback(
    ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
      initStartTime();

      // Check only real characters, don't check e.g. "Tab", "Shift", etc.
      if (key.length === 1) {
        const durationInMinutes = getDurationInMinutes(startTime);

        if (key === currentChar) {
          handleNewChar(durationInMinutes);

          if (text.charAt(0) === " ") {
            handleNewWord(durationInMinutes);
          }
        } else {
          handleErrorChar();
        }
      }
    },
    [currentChar, handleErrorChar, handleNewChar, handleNewWord, initStartTime, startTime, text]
  );

  const checkWorldRecord = useCallback((cpm: number) => {
    const WORLD_RECORD_CPM = 1080;

    const percentage = Math.round(100 - (cpm / WORLD_RECORD_CPM) * 100);

    if (cpm < WORLD_RECORD_CPM) {
      return `Typing world record is ${WORLD_RECORD_CPM} CPM. You typing speed is by ${percentage}% slower than this.`;
    } else {
      return `Typing world record is ${WORLD_RECORD_CPM} CPM. You typing speed is by ${percentage}% faster than this.`;
    }
  }, []);

  if (fetchError) {
    return <p>{fetchError}</p>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (isFinished()) {
    return (
      <div>
        <p>{checkWorldRecord(cpm)}</p>
        <InfoHeader cpm={cpm} wpm={wpm} accuracy={accuracy} />
        <button onClick={reset}>Reset</button>
      </div>
    );
  }
  return (
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
      <div className="quote-block">
        <Quote text={text} char={currentChar} outgoingChars={outgoingChars} isCorrectChar={isCorrectChar}></Quote>
        <button className="quote-block_button" onClick={reset}>
          Reset
        </button>
      </div>
      <InfoHeader cpm={cpm} wpm={wpm} accuracy={accuracy} />
    </div>
  );
}

export default App;
