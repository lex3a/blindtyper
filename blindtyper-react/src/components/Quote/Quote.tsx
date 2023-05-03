import "./Quote.css";

interface IQuoteProps {
  text: string;
}

export const Quote = ({ text }: IQuoteProps) => {
  return (
    <div className="quote">
      <p>{text}</p>
    </div>
  );
};
