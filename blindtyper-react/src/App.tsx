import { useState, useEffect } from "react";
import { InfoHeader } from "./components/InfoHeader";
import { Quote } from "./components/Quote";
import "./App.css";

function App() {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    async function getData(url: string) {
      const response = await fetch(url);
      const data = await response.json();
      setQuote(data);
    }
    getData("https://baconipsum.com/api/?type=meat-and-filler&paras=2");
  }, []);

  console.log(quote);

  return (
    <>
      <div className="flex">
        <Quote text={quote}></Quote>
        <InfoHeader />
      </div>
    </>
  );
}

export default App;
