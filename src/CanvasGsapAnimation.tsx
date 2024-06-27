import { useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import ImageBox from './elements/ImageBox';
import { useGSAP } from './GsapProvider';
import {
  ANIMATION_ANIMATE,
  ANIMATION_APPLY_DIRECTION,
  ANIMATION_APPLY_SCALE,
  ANIMATION_APPLY_TYPEWRTING,
  ANIMATION_ID,
  ANIMATION_SCALE,
  DIRECTION,
  TIMELINE_STATUS,
  TYPE_WRITING,
} from './animation/config';
import { IoClose } from 'react-icons/io5';
import VideoBox from './elements/VideoBox';
import { downloadVideo } from './utils';
import Konva from 'konva';
import TextBox from './elements/TextBox';
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 720;
const CONTROLS_WIDTH = 350;
const TOTAL_TIME_TEMPLATE = 6;
const FPS = 30;
const INTERVAL_DURATION_MS = 1 / FPS;
const IMAGE_TYPE = 'png';
const PAGES = [
  {
    pageIndex: 0,
    pageId: 'page_01',
    pageDuration: 5,
    animationsApply: [
      // {
      //   id: 'page_01_id_01',
      //   elementType: 'video',
      //   animationId: 'fade',
      //   speed: 1,
      //   scale: null,
      // },
      {
        id: 'page_01_id_02',
        elementType: 'image',
        animationId: 'pop',
        speed: 1,
        direction: null,
        scale: 'scale_in',
      },
      {
        id: 'page_01_id_03',
        elementType: 'image',
        animationId: 'zoom',
        speed: 1,
        direction: null,
        scale: 'scale_in',
      },
      {
        id: 'page_01_id_05',
        elementType: 'image',
        animationId: 'baseline',
        speed: 1,
        direction: 'direction_up',
        scale: null,
      },
      {
        id: 'page_01_id_04',
        elementType: 'image',
        animationId: 'rise',
        speed: 1,
        direction: 'direction_up',
        scale: null,
      },
    ],
    backgroundColor: '#ef8920',
    children: [
      {
        id: 'page_01_id_01',
        x: 0,
        y: 0,
        elementType: 'video',
        src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Video/adc807d379b1431ebf2c0eea75cd548c.mp4',
      },
      {
        id: 'page_01_id_02',
        x: 50,
        y: 100,
        elementType: 'image',
        src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Image/af123eac3ff3469a96cd1bf688e4f3f5.jpg',
      },
      {
        id: 'page_01_id_03',
        x: 400,
        y: 100,
        elementType: 'image',
        src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Image/96221dedae1846f3ac58226133062bdf.jpg',
      },
      {
        id: 'page_01_id_04',
        x: 300,
        y: 400,
        elementType: 'image',
        src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Image/af123eac3ff3469a96cd1bf688e4f3f5.jpg',
      },
      {
        id: 'page_01_id_05',
        x: 600,
        y: 400,
        elementType: 'image',
        src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Image/96221dedae1846f3ac58226133062bdf.jpg',
      },
    ],
  },
  {
    pageIndex: 1,
    pageId: 'page_02',
    pageDuration: 3,
    animationsApply: [],
    backgroundColor: '#f0f0f0',
    children: [
      // {
      //   id: 'page_02_id_01',
      //   x: 600,
      //   y: 100,
      //   elementType: 'image',
      //   src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Image/af123eac3ff3469a96cd1bf688e4f3f5.jpg',
      // },
      {
        id: 'page_02_id_02',
        x: 200,
        y: 300,
        elementType: 'text',
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
    readyNextFrame,
    setReadyNextFrame,
  } = useGSAP();

  const [selectedElementId, setSelectedElementId] = useState(null);
  const [animationId, setAnimationId] = useState(ANIMATION_ID.BASELINE);
  const [directionType, setDirectionType] = useState(DIRECTION.UP);
  const [typeWritingType, setTypeWritingType] = useState(TYPE_WRITING.WORD);
  const [scaleType, setScaleType] = useState(ANIMATION_SCALE.IN);
  const [animateType, setAnimateType] = useState(ANIMATION_ANIMATE.ENTER);
  const [speed, setSpeed] = useState(1);
  const [sizeTemplate, setSizeTemplate] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

  const [isOpenDetailApply, setIsOpenDetailApply] = useState(true);

  const [isExportVideo, setIsExportVideo] = useState(false);

  const [listPages, setListPages] = useState(PAGES);
  const [activePageId, setActivePageId] = useState(PAGES[1].pageId);

  const layerRef = useRef(null);

  const pageActive = useMemo(() => {
    return listPages.find((page) => page.pageId === activePageId);
  }, [listPages, activePageId]);

  const updateActivePage = (updatedPage) => {
    const index = listPages.findIndex((page) => page.pageId === activePageId);
    if (index !== -1) {
      const newPages = [...listPages];
      newPages[index] = {
        ...newPages[index],
        ...updatedPage,
      };
      setListPages(newPages);
    }
  };

  const renderElement = (props, index = 0, _animation = [], enable = false) => {
    const animation = _animation.find((elm) => elm.id === props.id);
    switch (props.elementType) {
      case 'image':
        return (
          <ImageBox
            key={index}
            elementIndex={index}
            elementAnimation={animation}
            isSelected={selectedElementId === props.id}
            visible={enable}
            {...props}
          />
        );
      case 'video':
        return (
          <VideoBox
            key={index}
            elementIndex={index}
            elementAnimation={animation}
            width={sizeTemplate.width}
            height={sizeTemplate.height}
            isSelected={selectedElementId === props.id}
            isExportVideo={isExportVideo}
            currentTimeCapture={currentTimeCapture}
            visible={enable}
            {...props}
          />
        );
      case 'text':
        return (
          <TextBox
            key={index}
            elementIndex={index}
            elementAnimation={animation}
            isSelected={selectedElementId === props.id}
            isExportVideo={isExportVideo}
            currentTimeCapture={currentTimeCapture}
            visible={enable}
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
    } else if (ANIMATION_APPLY_TYPEWRTING.includes(animationId)) {
      typeApply = 'elm_typeWriting';
    }
    const applySettingElm = {
      ['elm_normal']: {
        direction: null,
        scale: null,
        typeWriting: null,
      },
      ['elm_direction']: {
        direction: directionType,
        scale: null,
        typeWriting: null,
      },
      ['elm_scale']: {
        direction: null,
        scale: scaleType,
        typeWriting: null,
      },
      ['elm_typeWriting']: {
        typeWriting: typeWritingType,
        scale: null,
        direction: null,
      },
    }[typeApply];

    const updatedAnimation = {
      id: selectedElementId,
      animationId: animationId,
      speed: speed,
      ...applySettingElm,
    };

    // apply for one element
    if (selectedElementId) {
      const elmIndex = pageActive.animationsApply.findIndex((elm) => elm.id === selectedElementId);
      if (elmIndex !== -1) {
        const newAnimations = [...pageActive.animationsApply];
        newAnimations[elmIndex] = {
          ...newAnimations[elmIndex],
          ...updatedAnimation,
        };
        updateActivePage({ animationsApply: newAnimations });
      } else {
        updateActivePage({ animationsApply: [...pageActive.animationsApply, updatedAnimation] });
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
      updateActivePage({ animationsApply: animations });
    }
  };

  const removeApplyAnimation = (id) => {
    const newPageAnimations = pageActive.animationsApply.filter((elm) => elm.id !== id);
    updateActivePage({ animationsApply: newPageAnimations });
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
    // Konva.pixelRatio = 1.5;
  }, []);

  useEffect(() => {
    if (isExportVideo && readyNextFrame) {
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
          // await downloadVideo(framesRef.current, 'video.webm');
          setIsExportVideo(false);
        }
      };
      frameId.current = requestAnimationFrame(requestCapture);
      return () => cancelAnimationFrame(frameId.current);
    }
  }, [isExportVideo, currentTimeCapture, readyNextFrame]);

  const captureFrame = async () => {
    return new Promise((resolve, reject) => {
      try {
        const seekTime = +((currentTimeCapture * tl.duration()) / totalTime).toFixed(2);
        if (seekTime <= TOTAL_TIME_TEMPLATE) {
          tl.seek(seekTime, false); // Seek to the specific time without playing
          console.log('seeking to: ', seekTime, `/${TOTAL_TIME_TEMPLATE}`);
        }
        const frame = layerRef.current.toDataURL({ mimeType: `image/${IMAGE_TYPE}` });
        framesRef.current.push(frame);
        const a = document.createElement('a');
        a.href = frame;
        a.download = `frame-${framesRef.current.length}.${IMAGE_TYPE}`;
        a.click();
        setTimeout(() => {
          resolve(1);
        }, 300);
      } catch (error) {
        reject(error);
      }
    });
  };

  return (
    <div
      className="CanvasGsap"
      style={{
        marginLeft: 30,
        marginTop: 30,
        position: 'relative',
        width: sizeTemplate.width + 100 + CONTROLS_WIDTH,
        display: 'flex',
        gap: 16,
      }}
    >
      <div id="canvas-ground" style={{ width: sizeTemplate.width, position: 'relative' }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <button onClick={playAnimation}>Play</button>
          <button onClick={pauseResumeTimeline} style={{ width: '120px' }}>
            {timelineStatus === TIMELINE_STATUS.PAUSED ? 'Resume' : 'Pause'}
          </button>
          <button onClick={resetAnimation}>Reset</button>
          {/* <button onClick={exportVideoTemplate}>Export Video</button> */}
        </div>
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ marginRight: '16px' }}>Template Size:</h4>
            <input
              type="text"
              value={sizeTemplate.width}
              onChange={(e) => setSizeTemplate({ ...sizeTemplate, width: e.target.value })}
            />
            <span style={{ margin: '0 16px' }}>X</span>
            <input
              type="text"
              value={sizeTemplate.height}
              onChange={(e) => setSizeTemplate({ ...sizeTemplate, height: e.target.value })}
            />
          </div>
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
        <Stage width={sizeTemplate.width} height={sizeTemplate.height} onClick={handleSelectElement}>
          <Layer ref={layerRef}>
            <Rect width={sizeTemplate.width} height={sizeTemplate.height} fill={pageActive.backgroundColor} />
            {listPages.map((page, index) => {
              const enableElm = page.pageId === pageActive.pageId;
              return page.children.map((child, childIdx) => {
                return renderElement(child, childIdx, page.animationsApply, enableElm);
              });
            })}
            {/* <TestText elementIndex={0} elementAnimation={undefined} id={undefined} x={200} y={300} /> */}
          </Layer>
        </Stage>

        <div id="pages-thumb-preview" style={{ display: 'flex', gap: '4px', zIndex: 10, marginTop: 10 }}>
          {listPages.map((page, index) => {
            return (
              <div
                key={index}
                style={{
                  padding: 8,
                  width: '200px',
                  cursor: 'pointer',
                  border: pageActive.pageId === page.pageId ? '1px solid blue' : '1px solid #ccc',
                }}
                onClick={() => setActivePageId(page.pageId)}
              >
                {`Page ${index + 1} - ${page.pageDuration}s`}
              </div>
            );
          })}
        </div>
      </div>

      <div
        id="setting-ground"
        style={{
          width: CONTROLS_WIDTH,
          height: window.innerHeight,
          backgroundColor: '#efefef',
          overflowY: 'auto',
        }}
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
          {ANIMATION_APPLY_TYPEWRTING.includes(animationId) && (
            <>
              <h4 style={{ marginBottom: 8 }}>Type Writing:</h4>
              <select defaultValue={typeWritingType} onChange={(e) => setTypeWritingType(e.target.value)}>
                <option value={TYPE_WRITING.ELEMENT}>Element</option>
                <option value={TYPE_WRITING.CHARACTER}>Character</option>
                <option value={TYPE_WRITING.WORD}>Word</option>
              </select>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', alignItems: 'center' }}>
            <h4>
              Selected Id: <span style={{ color: 'Highlight' }}>{`${selectedElementId}`}</span>
            </h4>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* <button onClick={() => setTriggerPreviewAnimation(true)}>Preview</button> */}
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
                {pageActive.animationsApply.map((elmAnm) => {
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
                      {elmAnm?.typeWritting && <div>Type Writting: {`${elmAnm.typeWritting}`}</div>}
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
