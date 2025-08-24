import { Stage, Layer, Rect } from "react-konva";
import { useEffect, useState, useRef } from "react";
import { easings, useSpring, animated } from "@react-spring/konva";
import Whammy from "react-whammy";

const totalTime = 5000;
const FPS = 30;
const INTERVAL_DURATION_MS = 1000 / FPS;
const COLORS = ["royalblue", "crimson", "forestgreen", "orange", "purple", "teal", "brown", "pink", "yellow", "cyan"];
const ITEMS_LENGTH = 50;
const DELAY = 50;

const getRandomPosition = (existingPositions, width = 500, height = 500, size = 50) => {
  let x, y;
  do {
    x = Math.floor(Math.random() * (width - size));
    y = Math.floor(Math.random() * (height - size));
  } while (existingPositions.some(pos => Math.abs(pos.x - x) < size && Math.abs(pos.y - y) < size));
  return { x, y };
};

const createComplexAnimation = (index, pos) => {
  const baseConfig = {
    duration: 2000,
    easing: easings.easeInBack,
  };

  if (index % 3 === 0) {
    return {
      from: { x: pos.x, y: pos.y, opacity: 0 },
      to: { x: pos.x + 300, y: pos.y + 300, opacity: 1 },
      config: baseConfig,
      delay: index * DELAY,
    };
  } else if (index % 3 === 1) {
    return {
      from: { x: pos.x, y: pos.y },
      to: { x: pos.x - 200, y: pos.y - 200 },
      config: baseConfig,
      delay: index * DELAY,
    };
  } else {
    return {
      from: { x: pos.x, y: pos.y },
      to: { x: pos.x + 150, y: pos.y - 150 },
      config: baseConfig,
      delay: index * DELAY,
    };
  }
};

const CanvasCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [frameCount, setFrameCount] = useState(0);

  const layerRef = useRef(null);
  const framesRef = useRef([]);
  const frameId = useRef(null);

  const positions = Array.from({ length: ITEMS_LENGTH }, () => getRandomPosition([]));

  const animations = positions.map((pos, index) => useSpring(() => ({
    pause: true,
    reset: true,
    ...createComplexAnimation(index, pos),
  })));

  const startCapture = () => {
    setIsCapturing(true);
    setElapsedTime(0);
    setFrameCount(0);
    framesRef.current = [];

    animations.forEach(([_, api], index) => {
      const pos = positions[index];
      api.start({
        pause: true,
        reset: true,
        ...createComplexAnimation(index, pos),
        onPause: () => console.log("Paused at", elapsedTime + "ms"),
      });
    });
  };

  const startWithoutCapture = () => {
    animations.forEach(([_, api], index) => {
      const pos = positions[index];
      api.start({
        pause: true,
        reset: true,
        ...createComplexAnimation(index, pos),
      });
    });
  };

  useEffect(() => {
    if (isCapturing) {
      const captureAndAdvance = async () => {
        if (elapsedTime < totalTime) {
          await captureFrame(layerRef.current);
          setElapsedTime((prev) => +(prev + INTERVAL_DURATION_MS).toFixed(0));
          setFrameCount((frameCount) => frameCount + 1);
          animations.forEach(([_, api]) => api.resume());
        } else {
          console.log("Completed capturing frames", framesRef.current.length);
          downloadVideo(framesRef.current, "video.webm");
          setIsCapturing(false);
        }
      };

      frameId.current = requestAnimationFrame(captureAndAdvance);
      return () => cancelAnimationFrame(frameId.current);
    }
  }, [isCapturing, frameCount]);

  useEffect(() => {
    if (isCapturing && elapsedTime < totalTime) {
      frameId.current = requestAnimationFrame(() => setFrameCount((frameCount) => frameCount + 1));
    }
  }, [elapsedTime]);

  const captureFrame = async (canvas) => {
    return new Promise((resolve) => {
      animations.forEach(([_, api]) => api.pause());
      console.log("Paused at", elapsedTime + "ms");

      const frame = canvas.toDataURL({ mimeType: "image/webp" });
      framesRef.current.push(frame);
      resolve();
    });
  };

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

  return (
    <div className="CanvasBoard" style={{ marginLeft: 30, marginTop: 30 }}>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 4 }}>
        <button onClick={startCapture}>Start Capture</button>
        <button onClick={startWithoutCapture}>Start Without Capture</button>
        <button onClick={() => animations.forEach(([_, api], index) => api.set({ x: positions[index].x, y: positions[index].y, opacity: 1 }))}>Reset Animation</button>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div>{elapsedTime}ms/{totalTime}ms</div>
        <div>Frame Count: {frameCount}</div>
      </div>

      <Stage width={500} height={500}>
        <Layer ref={layerRef}>
          <Rect width={500} height={500} fill={"#efefef"} />
          {animations.map(([props], index) => (
            <animated.Rect
              key={index}
              x={props.x}
              y={props.y}
              opacity={props.opacity}
              width={50}
              height={50}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasCapture;
