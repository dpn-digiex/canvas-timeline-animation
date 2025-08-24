// CanvasFramerMotion.js
import React, { useState, useEffect } from 'react';
import { Stage, Layer, Circle, Rect } from 'react-konva';
import { motion, useAnimation } from 'framer-motion';

const easingOptions = [
  { name: 'easeInOut', value: 'easeInOut' },
  { name: 'linear', value: 'linear' },
  { name: 'easeIn', value: 'easeIn' },
  { name: 'easeOut', value: 'easeOut' },
];

const CanvasFramerMotion = () => {
  const controls = useAnimation();
  const [progress, setProgress] = useState(0);
  const [seekTime, setSeekTime] = useState(2); // Default to 2 seconds
  const [easing, setEasing] = useState('easeInOut');
  const [circleY, setCircleY] = useState(100);

  const handleInputChange = (event) => {
    const newValue = parseFloat(event.target.value);
    if (!isNaN(newValue)) {
      setProgress(newValue);
      setCircleY(newValue);
    }
  };

  useEffect(() => {
    controls.start({
      y: 400,
      transition: { duration: seekTime, ease: easing },
    });
  }, [controls, seekTime, easing]);

  useEffect(() => {
    controls.set({ y: progress });
  }, [controls, progress]);

  controls.onChange = (latest) => {
    setCircleY(latest.y);
  };

  const play = () => {
    controls.start({
      y: 400,
      transition: { duration: seekTime, ease: easing },
    });
  };

  const stop = () => {
    controls.stop();
  };

  const reset = () => {
    setProgress(0);
    setCircleY(100);
    controls.set({ y: 100 });
  };

  return (
    <div className="CanvasFramerMotion" style={{ marginLeft: 30 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <h4>Seek time:</h4>
        <input
          type="number"
          style={{ height: 16 }}
          value={seekTime}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value);
            if (!isNaN(newValue)) {
              setSeekTime(newValue);
            }
          }}
        />
        <select onChange={(e) => setEasing(e.target.value)} value={easing}>
          {easingOptions.map((option) => (
            <option key={option.name} value={option.value}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <button onClick={play}>Play</button>
        <button onClick={stop}>Stop</button>
        <button onClick={reset}>Reset</button>
      </div>

      <Stage width={500} height={500}>
        <Layer>
          <Rect width={500} height={500} fill={"#efefef"} />
          <Circle x={100} y={circleY} radius={50} fill="blue" />
        </Layer>
      </Stage>

      <div style={{ marginTop: 20 }}>
        <h4>Animation Progress:</h4>
        <input
          type="range"
          min="100"
          max="400"
          step="1"
          value={progress}
          onChange={handleInputChange}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default CanvasFramerMotion;
