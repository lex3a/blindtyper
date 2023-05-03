import "./InfoHeader.css";

interface IInfoHeaderProps {
  cpm?: number;
  wpm?: number;
  accuracy?: number;
}

export const InfoHeader = ({ cpm = 0, wpm = 0, accuracy = 100 }: IInfoHeaderProps) => {
  return (
    <>
      <div className="infoHeader">
        <div className="type-speed">
          <p>Speed:</p>
          <div>
            <p>{cpm} CPM</p>
            <p>{wpm} WPM</p>
          </div>
        </div>
        <div className="type-accuracy">
          <p>Accuracy:</p>
          <p>{accuracy}%</p>
        </div>
      </div>
    </>
  );
};
