import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Circle, Rect } from 'react-konva';
import { gsap } from 'gsap';
import { downloadVideo } from '../utils';

const TOTAL_TIME_TEMPLATE = 5;
const FPS = 30;
const INTERVAL_DURATION_MS = 1 / FPS;
const DURATION = 1.5;
const totalTimeAnime = DURATION * 3;
const DISTANCE = 700;
const WIDTH = 1080;
const HEIGHT = 1080;

const WIDTH_ELEMENT = 100;
const HEIGHT_ELEMENT = 100;

const CIRCLE_ATTRS_01 = {
  x: 100,
  y: 100,
  width: WIDTH_ELEMENT,
  height: HEIGHT_ELEMENT,
};
const CIRCLE_ATTRS_02 = {
  x: 300,
  y: 150,
  width: WIDTH_ELEMENT,
  height: HEIGHT_ELEMENT,
};
const CIRCLE_ATTRS_03 = {
  x: 500,
  y: 200,
  width: WIDTH_ELEMENT,
  height: HEIGHT_ELEMENT,
};

const CanvasGsapTimeline = () => {
  const [progress, setProgress] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const layerRef = useRef(null);
  const framesRef = useRef([]);
  const frameId = useRef(null);

  const circle1Ref = useRef(null);
  const circle2Ref = useRef(null);
  const circle3Ref = useRef(null);

  const tl = useRef(gsap.timeline({ paused: true })).current;

  const firstInit = useRef(true);
  useEffect(() => {
    if (isCapturing) {
      if (firstInit.current) {
        addAnimationTimeline();
        firstInit.current = false;
      }

      const requestCapture = async () => {
        if (elapsedTime < TOTAL_TIME_TEMPLATE) {
          await captureFrame(layerRef.current).then(() => {
            setElapsedTime((prev) => +(prev + INTERVAL_DURATION_MS).toFixed(2));
          });
        } else {
          console.log('Completed capturing frames', framesRef.current.length);
          downloadVideo(framesRef.current, 'video.webm');
          setIsCapturing(false);
        }
      };

      frameId.current = requestAnimationFrame(requestCapture);
      return () => cancelAnimationFrame(frameId.current);
    }
  }, [isCapturing, elapsedTime]);

  useEffect(() => {
    if (tl) {
      tl.progress(progress / 100);
    }
  }, [progress, tl]);

  const captureFrame = async (canvas) => {
    return new Promise((resolve) => {
      const seekTime = +((elapsedTime * tl.duration()) / totalTimeAnime).toFixed(2);
      if (seekTime <= TOTAL_TIME_TEMPLATE) {
        tl.seek(seekTime, false); // Seek to the specific time without playing
        console.log('seeking to: ', seekTime, `/${TOTAL_TIME_TEMPLATE}`);
      }
      const frame = canvas.toDataURL({ mimeType: 'image/webp' });
      framesRef.current.push(frame);
      // const a = document.createElement("a");
      // a.href = frame;
      // a.download = `frame-${framesRef.current.length}.png`;
      // a.click();
      setTimeout(() => {
        resolve(1);
      }, 100);
    });
  };

  const playAnimation = () => {
    resetAnimation();
    addAnimationTimeline();
    tl.play();
  };

  const resetAnimation = () => {
    tl.pause();
    tl.progress(0);
    setProgress(0);
    if (circle1Ref.current && circle2Ref.current && circle3Ref.current) {
      circle1Ref.current.setAttrs(CIRCLE_ATTRS_01);
      circle2Ref.current.setAttrs(CIRCLE_ATTRS_02);
      circle3Ref.current.setAttrs(CIRCLE_ATTRS_03);
      circle1Ref.current.getLayer().batchDraw();
      circle2Ref.current.getLayer().batchDraw();
      circle3Ref.current.getLayer().batchDraw();
    }
  };

  const handleInputChange = (event) => {
    const newValue = parseFloat(event.target.value);
    if (!isNaN(newValue)) {
      setProgress(newValue);
    }
  };

  const addAnimationTimeline = () => {
    tl.to(CIRCLE_ATTRS_01, {
      y: CIRCLE_ATTRS_01.y + DISTANCE,
      duration: DURATION,
      ease: 'back.in',
      onUpdate: () => {
        if (circle1Ref.current) {
          circle1Ref.current.y(CIRCLE_ATTRS_01.y);
          circle1Ref.current.getLayer().batchDraw();
        }
      },
    });
    tl.to(CIRCLE_ATTRS_02, {
      x: CIRCLE_ATTRS_02.x + DISTANCE,
      duration: DURATION,
      ease: 'circ.out',
      onUpdate: () => {
        if (circle2Ref.current) {
          circle2Ref.current.x(CIRCLE_ATTRS_02.x);
          circle2Ref.current.getLayer().batchDraw();
        }
      },
    });
    tl.to(CIRCLE_ATTRS_03, {
      y: CIRCLE_ATTRS_03.y + DISTANCE,
      duration: DURATION,
      ease: 'expo.inOut',
      onUpdate: () => {
        if (circle3Ref.current) {
          circle3Ref.current.y(CIRCLE_ATTRS_03.y);
          circle3Ref.current.getLayer().batchDraw();
        }
      },
    });
  };

  const startCapture = () => {
    setElapsedTime(0);
    setProgress(0);
    framesRef.current = [];
    frameId.current = null;
    setIsCapturing(true);
  };

  return (
    <div className="CanvasAnimateJS" style={{ marginLeft: 30, marginTop: 30 }}>
      <div style={{ marginBottom: 16 }}>
        <button onClick={playAnimation}>Play</button>
        <button onClick={resetAnimation}>Reset</button>
        <button onClick={startCapture}>Start Capture</button>
      </div>
      <div style={{ marginTop: 20 }}>
        <h4>Timeline Control:</h4>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={progress}
          onChange={handleInputChange}
          style={{ width: '100%' }}
        />
      </div>
      <Stage width={WIDTH} height={HEIGHT}>
        <Layer ref={layerRef}>
          <Rect width={WIDTH} height={HEIGHT} fill={'#efefef'} />
          <Circle ref={circle1Ref} {...CIRCLE_ATTRS_01} radius={50} fill="blue" />
          <Circle ref={circle2Ref} {...CIRCLE_ATTRS_02} radius={50} fill="red" />
          <Circle ref={circle3Ref} {...CIRCLE_ATTRS_03} radius={50} fill="green" />
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasGsapTimeline;
