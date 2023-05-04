import "./Quote.css";

interface IQuoteProps {
  text: string;
  char: string;
  isCorrectChar: boolean;
  outgoingChars: string;
}

export const Quote = ({ text, char, isCorrectChar, outgoingChars }: IQuoteProps) => {
  return (
    <div className="quote">
      <p>
        <span className="green">{outgoingChars}</span>
        <span className={isCorrectChar ? "green" : "red"}>{char}</span>
        <span>{text}</span>
      </p>
    </div>
  );
};
