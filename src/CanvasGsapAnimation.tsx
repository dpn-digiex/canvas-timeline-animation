import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import ImageBox from './elements/ImageBox';
import { useGSAP } from './GsapProvider';
import {
  ANIMATION_ANIMATE,
  ANIMATION_APPLY_DIRECTION,
  ANIMATION_APPLY_SCALE,
  ANIMATION_ID,
  ANIMATION_SCALE,
  DIRECTION,
  TIMELINE_STATUS,
  TYPE_WRITING,
} from './animation/config';
import { IoClose } from 'react-icons/io5';
import VideoBox from './elements/VideoBox';
import { downloadVideo } from './utils';

const PAGES = [
  {
    pageId: 'page_01',
    totalTime: 5,
    children: [
      {
        id: 'id_01',
        x: 50,
        y: 100,
        elementType: 'image',
        src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Image/af123eac3ff3469a96cd1bf688e4f3f5.jpg',
      },
      {
        id: 'id_02',
        x: 400,
        y: 100,
        elementType: 'image',
        src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Image/96221dedae1846f3ac58226133062bdf.jpg',
      },
      // {
      //   id: 'id_03',
      //   x: 100,
      //   y: 400,
      //   elementType: 'image',
      //   src: 'https://stg-brandelement-static.obello.com/64a56325164c716b4b40e5c8/Image/09331ef409b34989b4897a0e62f59cf5.jpg',
      // },
      // {
      //   id: 'id_04',
      //   x: 400,
      //   y: 400,
      //   elementType: 'image',
      //   src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Image/96221dedae1846f3ac58226133062bdf.jpg',
      // },
      {
        id: 'id_05',
        x: 200,
        y: 300,
        elementType: 'video',
        src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Video/8fb39a83fe76423d8201d969da61649b.mp4',
      },
    ],
  },
];

const elementAnimation = {
  id: '',
  elementType: '',
  animationId: ANIMATION_ID.NONE,
  speed: 0,
  delay: 0,
  timing: { enter: null, exit: null },
  // optional
  direction: null,
  scale: null,
  animate: ANIMATION_ANIMATE.ENTER,
  typeWriting: TYPE_WRITING.ELEMENT,
};

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TOTAL_TIME_TEMPLATE = 7;
const FPS = 30;
const INTERVAL_DURATION_MS = 1 / FPS;

const CanvasGsapAnimation = () => {
  const {
    timelineRef: tl,
    isPlayingTimeline,
    timelineStatus,
    elapsedTime,
    totalTime,
    pauseTimeline,
    resumeTimeline,
    resetTimeline,
    prepareTimeline,
    progressTimeline,
    setProgressTimeline,
    setTriggerPreviewAnimation,
  } = useGSAP();

  const [pageActive, setPageActive] = useState(PAGES[0]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [animationId, setAnimationId] = useState(ANIMATION_ID.NONE);
  const [directionType, setDirectionType] = useState(DIRECTION.UP);
  const [scaleType, setScaleType] = useState(ANIMATION_SCALE.IN);
  const [animateType, setAnimateType] = useState(ANIMATION_ANIMATE.ENTER);
  const [speed, setSpeed] = useState(1);

  const [animationsApply, setAnimationsApply] = useState([]);
  const [isOpenDetailApply, setIsOpenDetailApply] = useState(true);

  const [isExportVideo, setIsExportVideo] = useState(false);

  const layerRef = useRef(null);

  const renderElement = (props, index) => {
    const animation = animationsApply.find((elm) => elm.id === props.id);
    switch (props.elementType) {
      case 'image':
        return (
          <ImageBox
            key={index}
            elementIndex={index}
            elementAnimation={animation}
            isSelected={selectedElementId === props.id}
            {...props}
          />
        );
      case 'video':
        return (
          <VideoBox
            key={index}
            elementIndex={index}
            elementAnimation={animation}
            isSelected={selectedElementId === props.id}
            {...props}
          />
        );
      default:
        break;
    }
  };

  const handleSelectElement = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedElementId(null);
    } else {
      const id = e.target.parent.attrs.id;
      setSelectedElementId(id);
    }
  };

  const playAnimation = () => {
    setSelectedElementId(null);
    prepareTimeline();
  };

  const resetAnimation = () => {
    resetTimeline();
  };

  const pauseResumeTimeline = () => {
    if (timelineStatus === TIMELINE_STATUS.PLAYING) {
      pauseTimeline();
    } else if (timelineStatus === TIMELINE_STATUS.PAUSED) {
      resumeTimeline();
    }
  };

  const handleInputChange = (event) => {
    pauseTimeline();
    const newValue = parseFloat(event.target.value);
    if (!isNaN(newValue)) {
      setProgressTimeline(newValue);
    }
  };

  const handleApplyAnimation = () => {
    if (animationId === ANIMATION_ID.NONE) return;
    let typeApply = 'elm_normal';
    if (ANIMATION_APPLY_DIRECTION.includes(animationId)) {
      typeApply = 'elm_direction';
    } else if (ANIMATION_APPLY_SCALE.includes(animationId)) {
      typeApply = 'elm_scale';
    }
    const applySettingElm = {
      ['elm_normal']: {
        direction: null,
        scale: null,
      },
      ['elm_direction']: {
        direction: directionType,
        scale: null,
      },
      ['elm_scale']: {
        direction: null,
        scale: scaleType,
      },
    }[typeApply];
    const updatedAnimation = {
      id: selectedElementId,
      elementType: 'image',
      animationId: animationId,
      speed: speed,
      ...applySettingElm,
    };

    // apply for one element
    if (selectedElementId) {
      const elmIndex = animationsApply.findIndex((elm) => elm.id === selectedElementId);
      if (elmIndex !== -1) {
        const newAnimations = [...animationsApply];
        newAnimations[elmIndex] = {
          ...newAnimations[elmIndex],
          ...updatedAnimation,
        };
        setAnimationsApply(newAnimations);
      } else {
        setAnimationsApply([
          ...animationsApply,
          {
            ...elementAnimation,
            ...updatedAnimation,
          },
        ]);
      }
    } else {
      // apply for all elements
      const animations = pageActive.children.map((element) => {
        return {
          ...elementAnimation,
          ...updatedAnimation,
          id: element.id,
        };
      });
      setAnimationsApply(animations);
    }
  };

  const removeApplyAnimation = (id) => {
    const newAnimations = animationsApply.filter((elm) => elm.id !== id);
    setAnimationsApply(newAnimations);
  };

  const calculateStartTimePage = (pageId: string, availablePages: any) => {
    if (availablePages?.length === 0 || !availablePages) return 0;
    let startTime = 0;
    for (let i = 0; i < availablePages?.length; i++) {
      if (availablePages[i].id === pageId) break;
      startTime += availablePages?.[i]?.duration || 0; // Use optional chaining
    }
    return +startTime.toFixed(0);
  };

  const calculateEndTimePage = (pageId: string, availablePages: any) => {
    if (availablePages?.length === 0 || !availablePages) return 0;
    let startTime = 0;
    let indexPage = 0;
    for (let i = 0; i < availablePages?.length; i++) {
      if (availablePages[i].id === pageId) {
        indexPage = i;
        break;
      }
      startTime += availablePages?.[i]?.duration || 0; // Use optional chaining
    }
    return +(startTime + availablePages?.[indexPage]?.duration).toFixed(0);
    // return +(startTime).toFixed(0)
  };

  const calculateTimeout = (elementsApplied = []) => {
    if (elementsApplied.length === 0) return 0;
    let timeout = 0;
    let delay = 0;
    elementsApplied.forEach((element) => {
      if (element.animationId !== ANIMATION_ID.NONE) {
        timeout = element.speed > timeout ? element.speed : timeout;
        delay = element.delay && element.delay > delay ? element.delay : delay;
      }
    });
    timeout = timeout + delay;
    return +timeout.toFixed(0);
  };

  const exportVideoTemplate = () => {
    setIsExportVideo(true);
  };

  const [currentTimeCapture, setCurrentTimeCapture] = useState(0);
  const framesRef = useRef([]);
  const startProcessExport = useRef(true);
  const frameId = useRef(null);

  useEffect(() => {
    if (isExportVideo) {
      if (startProcessExport.current) {
        resetTimeline();
        prepareTimeline(false);
        startProcessExport.current = false;
      }
      const requestCapture = async () => {
        if (currentTimeCapture < TOTAL_TIME_TEMPLATE) {
          await captureFrame()
            .then(() => {
              setCurrentTimeCapture((prev) => +(prev + INTERVAL_DURATION_MS).toFixed(2));
            })
            .catch((error) => {
              console.log('error capture', error);
            });
        } else {
          console.log('Completed capturing frames', framesRef.current.length);
          await downloadVideo(framesRef.current, 'video.webm');
          setIsExportVideo(false);
        }
      };
      frameId.current = requestAnimationFrame(requestCapture);
      return () => cancelAnimationFrame(frameId.current);
    }
  }, [isExportVideo, currentTimeCapture]);

  const captureFrame = async () => {
    return new Promise((resolve, reject) => {
      try {
        const seekTime = +((currentTimeCapture * tl.duration()) / totalTime).toFixed(2);
        if (seekTime <= TOTAL_TIME_TEMPLATE) {
          tl.seek(seekTime, false); // Seek to the specific time without playing
          console.log('seeking to: ', seekTime, `/${TOTAL_TIME_TEMPLATE}`);
        }
        const frame = layerRef.current.toDataURL({ mimeType: 'image/webp' });
        framesRef.current.push(frame);
        // const a = document.createElement('a');
        // a.href = frame;
        // a.download = `frame-${framesRef.current.length}.png`;
        // a.click();
        setTimeout(() => {
          resolve(1);
        }, 200);
      } catch (error) {
        reject(error);
      }
    });
  };

  return (
    <div
      className="CanvasGsap"
      style={{ marginLeft: 30, marginTop: 30, position: 'relative', width: 1220, display: 'flex', gap: 16 }}
    >
      <div className="play-ground" style={{ width: CANVAS_WIDTH }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <button onClick={playAnimation}>Play</button>
          <button onClick={pauseResumeTimeline}>Pause</button>
          <button onClick={resetAnimation}>Reset</button>
          <button onClick={exportVideoTemplate}>Export Video</button>
        </div>
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ marginRight: '16px' }}>Timeline Control:</h4>
            <span style={{ width: '42px' }}>{`${elapsedTime}`}</span>
            <span>{`/ ${totalTime}s`}</span>
          </div>
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

        <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT} onClick={handleSelectElement}>
          <Layer ref={layerRef}>
            <Rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill={'#efefef'} />
            {PAGES.map((page, index) => {
              return page.children.map((child, childIdx) => {
                return renderElement(child, childIdx);
              });
            })}
            {/* <TestText elementIndex={0} elementAnimation={undefined} id={undefined} x={200} y={300} /> */}
          </Layer>
        </Stage>
      </div>

      <div
        className="setting-ground"
        style={{ flex: 1, width: 350, height: window.innerHeight, backgroundColor: '#efefef', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', padding: 8 }}>
          <h4 style={{ marginBottom: 8 }}>Animation Type:</h4>
          <select value={animationId} onChange={(e) => setAnimationId(e.target.value)}>
            {Object.keys(ANIMATION_ID).map((key) => {
              return (
                <option key={key} value={ANIMATION_ID[key]}>
                  {ANIMATION_ID[key]}
                </option>
              );
            })}
          </select>
          <h4 style={{ margin: '8px 0' }}>
            Speed: <span style={{ color: 'Highlight' }}>{`${speed}s`}</span>
          </h4>
          <input
            type="range"
            min={0.1}
            max={2}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            style={{ width: '100%' }}
          />
          <>
            <h4 style={{ marginBottom: 8 }}>Animate:</h4>
            <select defaultValue={animateType} onChange={(e) => setAnimateType(e.target.value)}>
              <option value={ANIMATION_ANIMATE.BOTH}>Both</option>
              <option value={ANIMATION_ANIMATE.ENTER}>Enter</option>
              <option value={ANIMATION_ANIMATE.EXIT}>Exit</option>
            </select>
          </>
          {ANIMATION_APPLY_DIRECTION.includes(animationId) && (
            <>
              <h4 style={{ marginBottom: 8 }}>Direction:</h4>
              <select defaultValue={directionType} onChange={(e) => setDirectionType(e.target.value)}>
                <option value="direction_left">left</option>
                <option value="direction_right">right</option>
                <option value="direction_down">down</option>
                <option value="direction_up">up</option>
              </select>
            </>
          )}
          {ANIMATION_APPLY_SCALE.includes(animationId) && (
            <>
              <h4 style={{ marginBottom: 8 }}>Scale:</h4>
              <select defaultValue={scaleType} onChange={(e) => setScaleType(e.target.value)}>
                <option value={ANIMATION_SCALE.IN}>Scale In</option>
                <option value={ANIMATION_SCALE.OUT}>Scale Out</option>
              </select>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', alignItems: 'center' }}>
            <h4>
              Selected Id: <span style={{ color: 'Highlight' }}>{`${selectedElementId}`}</span>
            </h4>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setTriggerPreviewAnimation(true)}>Preview</button>
              <button onClick={handleApplyAnimation}>Apply</button>
            </div>
          </div>
          <div>
            <div
              style={{ fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => setIsOpenDetailApply(!isOpenDetailApply)}
            >
              Detail apply animation {isOpenDetailApply ? `▼` : `▲`}
            </div>
            {isOpenDetailApply && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {animationsApply.map((elmAnm) => {
                  return (
                    <div
                      key={elmAnm.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        border: elmAnm.id === selectedElementId ? '1px solid blue' : '',
                      }}
                    >
                      <div
                        key={elmAnm.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          margin: '8px 0',
                          borderBottom: '0.5px solid #ccc',
                        }}
                      >
                        <h4>
                          Element Id: <span style={{ color: 'Highlight' }}>{`${elmAnm.id}`}</span>
                        </h4>
                        <div style={{ cursor: 'pointer' }} onClick={() => removeApplyAnimation(elmAnm.id)}>
                          {/* 🗙 */}
                          <IoClose fill="red" size={20} />
                        </div>
                      </div>
                      {elmAnm?.animationId && <div>Animation: {`${elmAnm.animationId}`}</div>}
                      {elmAnm?.animate && <div>Animate: {`${elmAnm.animate}`}</div>}
                      {elmAnm?.speed && <div>Speed: {`${elmAnm.speed}s`}</div>}
                      {elmAnm?.direction && <div>Direction: {`${elmAnm.direction}`}</div>}
                      {elmAnm?.scale && <div>Scale: {`${elmAnm.scale}`}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasGsapAnimation;
