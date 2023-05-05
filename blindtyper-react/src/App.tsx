import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { InfoHeader } from "./components/InfoHeader";
import { Quote } from "./components/Quote";
import { currentTime, getDurationInMinutes } from "./utils/time";
import "./App.css";

const DEFAULT_ACCURACY = 100;

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

  useEffect(() => {
    async function getData(url: string) {
      const response = await fetch(url);
      const [data] = await response.json();

      initQuoteStates(data);
      setLoading(false);
    }
    getData("https://baconipsum.com/api/?type=meat-and-filler&paras=1");
  }, [initQuoteStates]);

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

  const calculateWpm = (wordCount: number, durationInMinutes: number) => {
    return Math.round(wordCount / durationInMinutes);
  };

  // const calculateCpm = (charCount: number, durationInMinutes: number) => {
  //   return Math.round(charCount / durationInMinutes);
  // };

  const calculateCpm = useMemo(
    () => (charCount: number, durationInMinutes: number) => {
      return Math.round(charCount / durationInMinutes);
    },
    []
  );

  const calculateAccuracy = (errorChars: number, originalText: string) => {
    return Math.max((1000 - Math.round((1000 * errorChars) / originalText.length)) / 10, 0);
  };

  const handleBlur = useCallback(({ target }: React.FocusEvent<HTMLInputElement, Element>) => {
    target.focus();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
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
