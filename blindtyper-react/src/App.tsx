import { useState, useEffect } from "react";
import { InfoHeader } from "./components/InfoHeader";
import { Quote } from "./components/Quote";
import "./App.css";
import { currentTime } from "./utils/time";

function App() {
  const [quote, setQuote] = useState<Array<string>>([]);
  const [isLoading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [typedChars, setTypedChars] = useState(0);
  const [currentChar, setCurrentChar] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [outgoingChars, setOutgoingChars] = useState("");
  const [isCorrectChar, setCorrectChar] = useState(true);
  const [wpm, setWpm] = useState(0);
  const [cpm, setCpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

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

    initStartTime();

    setTypedChars((char) => char + 1);

    if (event.key === currentChar) {
      console.log("Got a symbol match!", currentChar, event.key);
      setCurrentChar(text.charAt(0));
      setText(text.substring(1));
      setOutgoingChars((prev) => prev + currentChar);
      setCorrectChar(true);
    } else if (event.key !== "Shift") {
      console.log("Char mismatch");
      setCorrectChar(false);
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
          <InfoHeader cpm={typedChars} />
        </div>
      )}
    </>
  );
}

export default App;
