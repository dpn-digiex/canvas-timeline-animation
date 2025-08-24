import { Stage, Layer, Rect } from "react-konva";
import useAnimation from "../useAnimation";
import { useEffect, useState } from "react";
import { easings } from "@react-spring/web";

const easingOptions = [
  { name: "easeInBack", easing: easings.easeInBack },
  { name: "easeInBounce", easing: easings.easeInBounce },
  { name: "easeInCirc", easing: easings.easeInCirc },
  { name: "easeInCubic", easing: easings.easeInCubic },
  { name: "easeInElastic", easing: easings.easeInElastic },
  { name: "easeInExpo", easing: easings.easeInExpo },
  { name: "easeInOutBack", easing: easings.easeInOutBack },
  { name: "easeInOutBounce", easing: easings.easeInOutBounce },
  { name: "easeInOutCirc", easing: easings.easeInOutCirc },
  { name: "easeInOutCubic", easing: easings.easeInOutCubic },
  { name: "easeInOutElastic", easing: easings.easeInOutElastic },
  { name: "easeInOutExpo", easing: easings.easeInOutExpo },
  { name: "easeInOutQuad", easing: easings.easeInOutQuad },
  { name: "easeInOutQuart", easing: easings.easeInOutQuart },
  { name: "easeInOutQuint", easing: easings.easeInOutQuint },
  { name: "easeInOutSine", easing: easings.easeInOutSine },
  { name: "easeInQuad", easing: easings.easeInQuad },
  { name: "easeInQuart", easing: easings.easeInQuart },
  { name: "easeInQuint", easing: easings.easeInQuint },
  { name: "easeInSine", easing: easings.easeInSine },
  { name: "easeOutBack", easing: easings.easeOutBack },
  { name: "easeOutBounce", easing: easings.easeOutBounce },
  { name: "easeOutCirc", easing: easings.easeOutCirc },
  { name: "easeOutCubic", easing: easings.easeOutCubic },
  { name: "easeOutElastic", easing: easings.easeOutElastic },
  { name: "easeOutExpo", easing: easings.easeOutExpo },
  { name: "easeOutQuad", easing: easings.easeOutQuad },
  { name: "easeOutQuart", easing: easings.easeOutQuart },
  { name: "easeOutQuint", easing: easings.easeOutQuint },
  { name: "easeOutSine", easing: easings.easeOutSine },
  { name: "linear", easing: easings.linear },
];

const CanvasBoard = () => {
  const [seekTime, setSeekTime] = useState(200);
  const [easing, setEasing] = useState(easingOptions[0].name);

  const {
    value: x,
    play,
    stop,
    resume,
    reset,
  } = useAnimation({
    from: 100,
    to: 400,
    duration: 5000,
    easing: easings[easing],
  });

  useEffect(() => {
    // find x value by seekTime follow easing type
  }, [seekTime]);

  return (
    <div className="CanvasBoard" style={{ marginLeft: 30 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <h4>Seek time:</h4>
        <input
          type="number"
          style={{ height: 16 }}
          value={seekTime}
          onChange={(e) => setSeekTime(e.target.value)}
        />
        <select onChange={(e) => setEasing(e.target.value)}>
          {easingOptions.map((option) => (
            <option key={option.name} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <button onClick={play}>Play</button>
        <button onClick={stop}>Stop</button>
        <button onClick={resume}>Resume</button>
        <button onClick={reset}>Reset</button>
      </div>

      <Stage width={500} height={500}>
        <Layer>
          <Rect width={500} height={500} fill={"#efefef"} />
          <Rect x={x} y={100} width={50} height={50} fill="royalblue" />
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasBoard;
