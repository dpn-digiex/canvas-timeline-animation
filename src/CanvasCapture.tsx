import { Stage, Layer, Rect } from "react-konva";
import { useEffect, useState, useRef } from "react";
import { easings,useSpring,animated } from "@react-spring/konva";
import useAnimation from "./useAnimation";
import Whammy from "react-whammy";

const totalTime = 3000;
const FPS = 30;
const INTERVAL_DURATION_MS = 1000 / FPS;

const CanvasCapture = () => {
  const [playAnimation, setPlayAnimation] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [frameCount, setFrameCount] = useState(0);

  const layerRef = useRef(null);
  const framesRef = useRef([]);
  const frameId = useRef(null);

  // const {
  //   value: x,
  //   play,
  //   stop,
  //   pause,
  //   resume,
  //   reset,
  // } = useAnimation({
  //   from: 100,
  //   to: 400,
  //   duration: 2000,
  //   easing: easings.easeInBounce,
  // });

  const [{ x }, api] = useSpring(() => ({
    from: { x: 100 },
    to: { x: 400 },
    pause: true,
    reset: true,
  }));

  const startCapture = () => {
    setPlayAnimation(true);
    setElapsedTime(0);
    setFrameCount(0);
    api.start({
      from: { x: 100 },
      to: { x: 400 },
      config: {
        duration: 2000,
      }
    });
  };

  useEffect(() => {
    if (playAnimation) {
      if (frameId.current) cancelAnimationFrame(frameId.current);

      const captureAndAdvance = async () => {
        if (elapsedTime < totalTime) {
          setElapsedTime((prev) => +(prev + INTERVAL_DURATION_MS).toFixed(0));
          await captureFrame(layerRef.current).then(() => {
            api.resume();
            setFrameCount((frameCount) => frameCount + 1);
          });
        } else {
          console.log("Completed capturing frames", framesRef.current.length);
          // downloadVideo(framesRef.current, "video.webm");
        }
      };
      frameId.current = requestAnimationFrame(captureAndAdvance);
      return () => cancelAnimationFrame(frameId.current);
    }
  }, [playAnimation, frameCount]);

  const captureFrame = async (canvas: any) => {
    return new Promise((resolve) => {
      api.pause();
      const frame = canvas.toDataURL({ mimeType: "image/webp" });
      framesRef.current.push(frame);
      resolve();
    });
  };

  const createVideoFromFrames = (frames, fps = FPS) => {
    return new Promise((resolve, reject) => {
      try {
        const whammy = new Whammy.Video(fps);
        const imagePromises = frames.map((frame, index) => {
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

  return (
    <div className="CanvasBoard" style={{ marginLeft: 30, marginTop: 30 }}>
      <div style={{ marginBottom: 16 }}>
        <button onClick={startCapture}>Start Capture</button>
        <button onClick={api.reset}>Reset Animation</button>
      </div>
      <div>{}</div>

      <Stage width={500} height={500}>
        <Layer ref={layerRef}>
          <Rect width={500} height={500} fill={"#efefef"} />
          <animated.Rect x={x} y={100} width={50} height={50} fill="royalblue" />
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasCapture;
