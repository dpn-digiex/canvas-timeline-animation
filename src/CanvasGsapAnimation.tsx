import { useRef } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import ImageBox from './elements/ImageBox';
import { useGSAP } from './GsapProvider';

const elementData = [
  {
    x: 200,
    y: 100,
    src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Image/ce7c32a2384c4232b5719e87be08fc52.jpg',
  },
  // {
  //   x: 400,
  //   y: 100,
  //   src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Image/96221dedae1846f3ac58226133062bdf.jpg',
  // },
  // {
  //   x: 100,
  //   y: 400,
  //   src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Image/ce7c32a2384c4232b5719e87be08fc52.jpg',
  // },
  // {
  //   x: 400,
  //   y: 400,
  //   src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Image/96221dedae1846f3ac58226133062bdf.jpg',
  // },
];

const totalTime = 5;
const FPS = 30;
const INTERVAL_DURATION_MS = 1 / FPS;
const DURATION = 1.5;
const totalTimeAnime = DURATION * 3;
const DISTANCE = 400;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const CanvasGsapAnimation = () => {
  const {
    animationId,
    setAnimationId,
    direction,
    setDirection,
    pauseTimeline,
    resetTimeline,
    playTimeline,
    progressTimeline,
    setProgressTimeline,
  } = useGSAP();

  const layerRef = useRef(null);

  const playAnimation = () => {
    playTimeline();
  };

  const resetAnimation = () => {
    resetTimeline();
  };

  const handleInputChange = (event) => {
    pauseTimeline();
    const newValue = parseFloat(event.target.value);
    if (!isNaN(newValue)) {
      setProgressTimeline(newValue);
    }
  };

  return (
    <div className="CanvasGsap" style={{ marginLeft: 30, marginTop: 30 }}>
      <div style={{ marginBottom: 16 }}>
        <button onClick={playAnimation}>Play</button>
        <button onClick={resetAnimation}>Reset</button>
        <select value={animationId} onChange={(e) => setAnimationId(e.target.value)}>
          <option value="none">None</option>
          <option value="fade">Fade</option>
          <option value="wipe">Wipe</option>
          <option value="baseline">Baseline</option>
          <option value="rise">Rise</option>
          <option value="pan">Pan</option>
          <option value="pop">Pop</option>
          <option value="neon">Neon</option>
          <option value="breath">Breath</option>
          <option value="zoom">Zoom</option>
          <option value="typewriter">Typewriter</option>
          <option value="ascend">Ascend</option>
        </select>
        <select defaultValue={direction} onChange={(e) => setDirection(e.target.value)}>
          <option value="direction_left">left</option>
          <option value="direction_right">right</option>
          <option value="direction_down">down</option>
          <option value="direction_up">up</option>
        </select>
      </div>
      <div style={{ marginTop: 20 }}>
        <h4>Timeline Control:</h4>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={progressTimeline}
          onChange={handleInputChange}
          style={{ width: '100%' }}
        />
      </div>

      <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        <Layer ref={layerRef}>
          <Rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill={'#efefef'} />
          {elementData.map((props, index) => {
            return <ImageBox key={index} {...props} />;
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasGsapAnimation;
