import { useState, useEffect } from "react";
import { InfoHeader } from "./components/InfoHeader";
import { Quote } from "./components/Quote";
import "./App.css";
import { currentTime } from "./utils/time";

function App() {
  const [quote, setQuote] = useState<Array<string>>([]);
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

  useEffect(() => {
    async function getData(url: string) {
      const response = await fetch(url);
      const data = await response.json();
      setQuote(data);
      initQuoteStates(data);
      setLoading(false);
    }
    getData("https://baconipsum.com/api/?type=meat-and-filler&paras=2");
  }, []);

  const handleBlur = (event: React.FocusEvent<HTMLInputElement, Element>) => {
    event.target.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab") {
      event.preventDefault();
    }

    let updatedOutgoingChars = outgoingChars;

    initStartTime();

    if (event.key === currentChar) {
      console.log("Got a symbol match!", currentChar, event.key);
      setCurrentChar(text.charAt(0));
      setText(text.substring(1));
      updatedOutgoingChars += currentChar;
      setOutgoingChars(updatedOutgoingChars);
      setCorrectChar(true);
      const durationInMinutes = (currentTime() - startTime) / 60000.0;
      const newCpm = calculateCpm(updatedOutgoingChars.length, durationInMinutes);
      setCpm(newCpm);

      if (text.charAt(0) === " ") {
        const durationInMinutes = (currentTime() - startTime) / 60000.0;
        const newWordCount = wordCount + 1;
        const newWpm = calculateWpm(newWordCount, durationInMinutes);
        setWpm(newWpm);
        console.log(newWpm);
        setWordCount(newWordCount);
      }
    } else if (event.key.length === 1) {
      console.log("Char mismatch");
      setCorrectChar(false);

      const newAccuracy = calculateAccuracy(updatedOutgoingChars, quote);
      setAccuracy(newAccuracy);
    }
  };

  const initStartTime = () => {
    if (!startTime) {
      setStartTime(currentTime());
    }
  };

  const initQuoteStates = (quote: string[]) => {
    setCurrentChar(quote[0].charAt(0));
    setText(quote[0].substring(1));
  };

  const calculateWpm = (wordCount: number, durationInMinutes: number) => {
    return Math.round(wordCount / durationInMinutes);
  };

  const calculateCpm = (charCount: number, durationInMinutes: number) => {
    return Math.round(charCount / durationInMinutes);
  };

  const calculateAccuracy = (outgoingChars: string, originalText: string[]) => {
    let correctChars = 0;
    for (let i = 0; i < quote[0].length; i++) {
      if (outgoingChars[i] && outgoingChars[i] === originalText[0][i]) {
        correctChars++;
      }
    }
    const accuracy = Math.round(100 - (correctChars / quote[0].length) * 100);

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
          <Quote text={text} char={currentChar} outgoingChars={outgoingChars} isCorrectChar={isCorrectChar}></Quote>
          <InfoHeader cpm={cpm} wpm={wpm} accuracy={accuracy} />
        </div>
      )}
    </>
  );
}

export default App;
