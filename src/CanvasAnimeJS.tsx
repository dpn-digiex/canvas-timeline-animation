import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Circle, Rect, Image } from 'react-konva';
import anime from 'animejs/lib/anime.es.js';
import Whammy from "react-whammy";
import Konva from 'konva';

const totalTime = 5500;
const FPS = 60;
const INTERVAL_DURATION_MS = 1000 / FPS;
const DURATION = 1000;
const totalTimeAnime = DURATION * 3;
const DISTANCE = 600;

const CIRCLE_POSITIONS_01 = { x: 100, y: 100, width: 400, height: 400 };
const CIRCLE_POSITIONS_02 = { x: 300, y: 50, width: 400, height: 400 };
const CIRCLE_POSITIONS_03 = { x: 200, y: 50, width: 400, height: 400 };

const CanvasAnimeJS = () => {
  const [progress, setProgress] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const layerRef = useRef(null);
  const framesRef = useRef([]);
  const frameId = useRef(null);

  const circle1Ref = useRef(null);
  const circle2Ref = useRef(null);
  const circle3Ref = useRef(null);

  const videoRef = useRef(null);
  const videoElement = useRef(document.createElement('video'));
  const layer = videoRef.current?.getLayer();
  const anim = new Konva.Animation(() => {}, layer);

  const animeInstance = useRef(anime.timeline({
    autoplay: false,
    duration: totalTimeAnime,
    loop: false,
  })).current;

  useEffect(() => {
    if (videoElement.current) {
      videoElement.current.src = "https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Video/8fb39a83fe76423d8201d969da61649b.mp4"; // Thay bằng URL video của bạn
      videoElement.current.load();
      videoElement.current.addEventListener('loadedmetadata', () => {
        videoElement.current.currentTime = 0;
      });
    }
  }, []);

  const firstInit = useRef(true);
  useEffect(() => {
    if (isCapturing) {
      if (firstInit.current) {
        addAnimationTimeline();
        firstInit.current = false;
      }

      const captureAndAdvance = async () => {
        if (elapsedTime < totalTime) {
          await captureFrame(layerRef.current).then(() => {
            setElapsedTime((prev) => +(prev + INTERVAL_DURATION_MS).toFixed(0));
          });
        } else {
          console.log("Completed capturing frames", framesRef.current.length);
          downloadVideo(framesRef.current, "video.webm");
          setIsCapturing(false);
        }
      };

      frameId.current = requestAnimationFrame(captureAndAdvance);
      return () => cancelAnimationFrame(frameId.current);
    }
  }, [isCapturing, elapsedTime]);

  

  useEffect(() => {
    // Update the animation progress when the progress state changes
    if (animeInstance) {
      animeInstance.seek((animeInstance.duration * progress) / 100);
    }
  }, [progress]);

  const createVideoFromFrames = (frames, fps = FPS) => {
    return new Promise((resolve, reject) => {
      try {
        const whammy = new Whammy.Video(fps);
        const imagePromises = frames.map((frame) => {
          return new Promise((resolve, reject) => {
            if (typeof frame === "string" && frame.startsWith("data:image/")) {
              resolve(frame);
            } else {
              const img = new Image();
              img.src = frame;
              img.onload = () => {
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0);
                const dataURI = canvas.toDataURL("image/webp");
                resolve(dataURI);
              };
              img.onerror = () => {
                reject();
              };
            }
          });
        });

        Promise.all(imagePromises)
          .then((images) => {
            images.forEach((img) => {
              whammy.add(img);
            });
            whammy.compile(false, (output) => {
              const url = URL.createObjectURL(output);
              resolve(url);
            });
          })
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  };

  const downloadVideo = async (frames, filename) => {
    const videoUrl = await createVideoFromFrames(frames);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = videoUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(videoUrl);
  };

  const captureFrame = async (canvas) => {
    return new Promise((resolve) => {
      console.log("seeking to: ", elapsedTime + "ms");
      
      if (((elapsedTime * animeInstance.duration) / totalTimeAnime) <= totalTimeAnime) {
        animeInstance.seek((elapsedTime * animeInstance.duration) / totalTimeAnime);
      }
      videoElement.current.currentTime = elapsedTime;
      anim?.start();
      const frame = canvas.toDataURL({ mimeType: "image/png" });
      framesRef.current.push(frame);
      // const a = document.createElement("a");
      // a.style.display = "none";
      // a.href = frame;
      // a.download = `frame-${framesRef.current.length}.jpeg`;
      // a.click();
      // setTimeout(() => {
      resolve(1);
      // }, 50);
    });
  };

  const playAnimation = () => {
    addAnimationTimeline();
    animeInstance.play();
  };

  const resetAnimation = () => {
    if (animeInstance) {
      animeInstance.pause();
    }
    if (circle1Ref.current && circle2Ref.current && circle3Ref.current) {
      circle1Ref.current.y(CIRCLE_POSITIONS_01.y);
      circle2Ref.current.x(CIRCLE_POSITIONS_02.x);
      circle3Ref.current.y(CIRCLE_POSITIONS_03.y);
      circle1Ref.current.getLayer().batchDraw();
      circle2Ref.current.getLayer().batchDraw();
      circle3Ref.current.getLayer().batchDraw();
    }
  };

  const addAnimationTimeline = () => {
    animeInstance.add({
      targets: CIRCLE_POSITIONS_01,
      y: CIRCLE_POSITIONS_01.y + DISTANCE,
      duration: DURATION,
      easing: 'easeInBack',
      update: (anim) => {
        if (circle1Ref.current) {
          circle1Ref.current.y(anim.animations[0].currentValue);
          circle1Ref.current.getLayer().batchDraw(); // Force Konva to redraw the layer
        }
      },
    });
    animeInstance.add({
      targets: CIRCLE_POSITIONS_02,
      x: CIRCLE_POSITIONS_02.x + DISTANCE,
      duration: DURATION,
      easing: "easeInCubic",
      update: (anim) => {
        if (circle2Ref.current) {
          circle2Ref.current.x(anim.animations[0].currentValue);
          circle2Ref.current.getLayer().batchDraw(); // Force Konva to redraw the layer
        }
      },
    });
    animeInstance.add({
      targets: CIRCLE_POSITIONS_03,
      y: CIRCLE_POSITIONS_03.y + DISTANCE,
      duration: DURATION,
      easing: 'easeInBack',
      update: (anim) => {
        if (circle3Ref.current) {
          circle3Ref.current.y(anim.animations[0].currentValue);
          circle3Ref.current.getLayer().batchDraw(); // Force Konva to redraw the layer
        }
      },
    });
  };

  const handleInputChange = (event) => {
    const newValue = parseFloat(event.target.value);
    if (!isNaN(newValue)) {
      setProgress(newValue);
    }
  };

  const startCapture = () => {
    setElapsedTime(0);
    setProgress(0);
    framesRef.current = [];
    frameId.current = null;
    if (videoElement.current.readyState >= 1) { // Check if video metadata is loaded
      console.log("Video metadata loaded");
      setIsCapturing(true);
    } else {
      videoElement.current.addEventListener('loadeddata', () => {
        console.log("Video metadata loaded");
        setIsCapturing(true);
      });
    }
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

      <Stage width={800} height={800}>
        <Layer ref={layerRef}>
          <Rect width={800} height={800} fill={"#efefef"} />
          <Circle ref={circle1Ref} {...CIRCLE_POSITIONS_01} radius={50} fill="blue" />
          <Circle ref={circle2Ref} {...CIRCLE_POSITIONS_02} radius={50} fill="red" />
          <Circle ref={circle3Ref} {...CIRCLE_POSITIONS_03} radius={50} fill="green" />
          <Image
            ref={videoRef}
            x={100}
            y={100}
            width={500}
            height={400}
            image={videoElement.current}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasAnimeJS;
