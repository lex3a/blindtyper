import { useState, useEffect, KeyboardEvent } from "react";
import { InfoHeader } from "./components/InfoHeader";
import { Quote } from "./components/Quote";
import "./App.css";

function App() {
  const [quote, setQuote] = useState("");
  const [text, setText] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [typedChars, setTypedChars] = useState(0);

  useEffect(() => {
    async function getData(url: string) {
      const response = await fetch(url);
      const data = await response.json();
      setQuote(data);
      setLoading(false);
    }
    getData("https://baconipsum.com/api/?type=meat-and-filler&paras=2");
  }, []);

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex">
          <p>{text}</p>
          <Quote text={quote}></Quote>
          <InfoHeader cpm={typedChars} />
        </div>
      )}
    </>
  );
}

export default App;
