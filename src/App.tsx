import React, { useState } from "react";
import { useSpring, animated, easings } from "@react-spring/web";

const EASING_FUNC = easings.easeInBack;

function App() {
  const [rangeValue, setRangeValue] = useState(0);
  const [animationToggle, setAnimationToggle] = useState(false);
  const [pausedValue, setPausedValue] = useState(0);

  const springProps = useSpring({
    from: { x: pausedValue },
    to: { x: 300 },
    config: {
      duration: 1200,
      easing: EASING_FUNC,
    },
    onChange: ({ value }) => {
      const timeElapsed = (value.x / 300) * 1200;
      setRangeValue(timeElapsed);
    },
    pause: !animationToggle,
    onRest: () => {
      if (animationToggle) {
        setAnimationToggle(false);
        setPausedValue(0);
      }
    },
  });

  const handleStart = () => {
    setAnimationToggle(true);
    if (pausedValue !== 0) {}
  };

  const handlePauseResume = () => {
    setAnimationToggle(!animationToggle);
  };

  const handleReset = () => {
    setRangeValue(0);
    springProps.x.set(0);
    setPausedValue(0);
    setAnimationToggle(false);
  };

  const handleRangeChange = (event) => {
    const value = parseFloat(event.target.value);
    setRangeValue(value);
    // Calculate the eased value
    const easingFunction = EASING_FUNC;
    const normalizedTime = value / 1200;
    const easedTime = easingFunction(normalizedTime);
    const easedValue = easedTime * 300;

    springProps.x.set(easedValue);
    setAnimationToggle(false);
  };

  return (
    <div style={{ marginLeft: "30px" }}>
      <animated.div
        style={{
          width: 50,
          height: 50,
          backgroundColor: "blue",
          transform: springProps.x.to((x) => `translateX(${x}px)`),
        }}
      />
      <div>
        <button onClick={handleStart} style={{ width: 100 }}>
          Start
        </button>
        <button onClick={handlePauseResume} style={{ width: 100 }}>
          {animationToggle ? "Pause" : "Resume"}
        </button>
        <button onClick={handleReset} style={{ width: 100 }}>
          Reset
        </button>
      </div>
      <div>
        <input
          type="range"
          min="0"
          max="1200"
          step="50"
          value={rangeValue}
          onChange={handleRangeChange}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}

const calculateSpringValueWithEasing = (
  t,
  duration,
  config,
  easingFunction,
) => {
  const { mass, tension, friction } = config;
  const normalizedTime = t / duration;
  const easedTime = easingFunction(normalizedTime);
  const elapsed = easedTime * duration;

  const omega0 = Math.sqrt(tension / mass);
  const zeta = friction / (2 * Math.sqrt(tension * mass));
  const omega1 = omega0 * Math.sqrt(1 - zeta * zeta);
  const envelope = Math.exp(-zeta * omega0 * elapsed);

  let value;

  if (zeta < 1) {
    // Underdamped
    value =
      1 -
      envelope *
        (Math.cos(omega1 * elapsed) +
          ((zeta * omega0) / omega1) * Math.sin(omega1 * elapsed));
  } else if (zeta === 1) {
    // Critically damped
    value = 1 - envelope * (1 + omega0 * elapsed);
  } else {
    // Overdamped
    const lambda1 = -omega0 * (zeta - Math.sqrt(zeta * zeta - 1));
    const lambda2 = -omega0 * (zeta + Math.sqrt(zeta * zeta - 1));
    const C1 = 1;
    const C2 = (zeta - lambda1) / (lambda2 - lambda1);
    value =
      1 - (C1 * Math.exp(lambda1 * elapsed) + C2 * Math.exp(lambda2 * elapsed));
  }

  return value * 300; // Scale to the animation range [0, 300]
};

export default App;
