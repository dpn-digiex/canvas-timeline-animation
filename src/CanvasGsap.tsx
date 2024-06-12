import { useRef, useEffect, useState } from "react";
import { Stage, Layer, Circle, Rect, Image, Group } from "react-konva";
import { gsap } from "gsap";
import Whammy from "react-whammy";
import useImage from "use-image";

const totalTime = 5;
const FPS = 30;
const INTERVAL_DURATION_MS = 1 / FPS;
const DURATION = 1.5;
const totalTimeAnime = DURATION * 3;
const DISTANCE = 700;
const WIDTH = 1080;
const HEIGHT = 1080;

const WIDTH_ELEMENT = 100;
const HEIGHT_ELEMENT = 100;

const IMAGE_WIDTH_ELEMENT = 500;
const IMAGE_HEIGHT_ELEMENT = 500;

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

const IMAGE_ATTRS_01 = {
  x: 0,
  y: 200,
  width: IMAGE_WIDTH_ELEMENT,
  height: IMAGE_HEIGHT_ELEMENT,
};
const IMAGE_ATTRS_02 = {
  x: 600,
  y: 200,
  width: IMAGE_WIDTH_ELEMENT,
  height: IMAGE_HEIGHT_ELEMENT,
};
const GROUP_IMAGE_ATTRS_01 = {
  cropX: 0,
  cropY: 200,
  cropWidth: IMAGE_WIDTH_ELEMENT,
  cropHeight: IMAGE_HEIGHT_ELEMENT,
};
const GROUP_IMAGE_ATTRS_02 = {
  x: 600,
  y: 200,
  width: IMAGE_WIDTH_ELEMENT,
  height: IMAGE_HEIGHT_ELEMENT,
  cropX: 600,
  cropY: 200,
  cropWidth: IMAGE_WIDTH_ELEMENT,
  cropHeight: IMAGE_HEIGHT_ELEMENT,
};
const CanvasGsap = () => {
  const [progress, setProgress] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const layerRef = useRef(null);
  const framesRef = useRef([]);
  const frameId = useRef(null);

  const circle1Ref = useRef(null);
  const circle2Ref = useRef(null);
  const circle3Ref = useRef(null);

  const groupImage1Ref = useRef(null);
  const groupImage2Ref = useRef(null);

  const [image] = useImage(
    "https://lumiere-a.akamaihd.net/v1/images/darth-vader-main_4560aff7.jpeg?region=71%2C0%2C1139%2C854"
  );
  const [image2] = useImage(
    "  //upload.wikimedia.org/wikipedia/en/f/ff/Timoth%C3%A9e_Chalamet_as_Paul_Atreides_%28Dune_2021%29.jpg"
  );
  const tl = useRef(gsap.timeline({ paused: true })).current;

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
            setElapsedTime((prev) => +(prev + INTERVAL_DURATION_MS).toFixed(2));
          });
        } else {
          console.log("Completed capturing frames", framesRef.current.length);
          // downloadVideo(framesRef.current, "video.webm");
          setIsCapturing(false);
        }
      };

      frameId.current = requestAnimationFrame(captureAndAdvance);
      return () => cancelAnimationFrame(frameId.current);
    }
  }, [isCapturing, elapsedTime]);

  useEffect(() => {
    if (tl) {
      tl.progress(progress / 100);
    }
  }, [progress, tl]);

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
      const seekTime = +(
        (elapsedTime * tl.duration()) /
        totalTimeAnime
      ).toFixed(2);
      if (seekTime <= totalTime) {
        tl.seek(seekTime, false); // Seek to the specific time without playing
        console.log("seeking to: ", seekTime, `/${totalTime}`);
      }
      const frame = canvas.toDataURL({ mimeType: "image/png" });
      framesRef.current.push(frame);
      const a = document.createElement("a");
      a.href = frame;
      a.download = `frame-${framesRef.current.length}.png`;
      a.click();
      setTimeout(() => {
        resolve(1);
      }, 300);
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
      ease: "back.in",
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
      ease: "circ.out",
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
      ease: "expo.inOut",
      onUpdate: () => {
        if (circle3Ref.current) {
          circle3Ref.current.y(CIRCLE_ATTRS_03.y);
          circle3Ref.current.getLayer().batchDraw();
        }
      },
    });

    tl.fromTo(
      GROUP_IMAGE_ATTRS_01,
      {
        cropY: GROUP_IMAGE_ATTRS_01.cropY + GROUP_IMAGE_ATTRS_01.cropHeight,
      },
      {
        cropY: GROUP_IMAGE_ATTRS_01.cropY,
        duration: DURATION,
        ease: "expo.out",
        onUpdate: () => {
          if (groupImage1Ref.current) {
            // groupImage1Ref.current.cropX(GROUP_IMAGE_ATTRS_01.cropX);
            groupImage1Ref.current.setAttrs({
              clipFunc: (ctx) => {
                ctx.rect(
                  GROUP_IMAGE_ATTRS_01.cropX,
                  GROUP_IMAGE_ATTRS_01.cropY,
                  GROUP_IMAGE_ATTRS_01.cropWidth,
                  GROUP_IMAGE_ATTRS_01.cropHeight
                );
              },
            });
            groupImage1Ref.current.getLayer().batchDraw();
          }
        },
      }
    );
    tl.fromTo(
      GROUP_IMAGE_ATTRS_02,
      {
        y: GROUP_IMAGE_ATTRS_02.y + GROUP_IMAGE_ATTRS_02.height,
        cropY: GROUP_IMAGE_ATTRS_02.cropY + GROUP_IMAGE_ATTRS_02.cropHeight,
      },
      {
        y: 0,
        cropY: GROUP_IMAGE_ATTRS_02.cropY,
        duration: DURATION,
        ease: "expo.out",
        onUpdate: () => {
          console.log(GROUP_IMAGE_ATTRS_02.y);

          if (groupImage2Ref.current) {
            groupImage2Ref.current.y(GROUP_IMAGE_ATTRS_02.y);
            groupImage2Ref.current.setAttrs({
              clipFunc: (ctx) => {
                ctx.rect(
                  GROUP_IMAGE_ATTRS_02.cropX,
                  GROUP_IMAGE_ATTRS_02.cropY,
                  GROUP_IMAGE_ATTRS_02.cropWidth,
                  GROUP_IMAGE_ATTRS_02.cropHeight
                );
              },
            });
            groupImage2Ref.current.getLayer().batchDraw();
          }
        },
      }
    );
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
          style={{ width: "100%" }}
        />
      </div>
      <Stage width={WIDTH} height={HEIGHT}>
        <Layer ref={layerRef}>
          <Rect width={WIDTH} height={HEIGHT} fill={"#efefef"} />
          <Circle
            ref={circle1Ref}
            {...CIRCLE_ATTRS_01}
            radius={50}
            fill="blue"
          />
          <Circle
            ref={circle2Ref}
            {...CIRCLE_ATTRS_02}
            radius={50}
            fill="red"
          />
          <Circle
            ref={circle3Ref}
            {...CIRCLE_ATTRS_03}
            radius={50}
            fill="green"
          />

          <Group ref={groupImage1Ref}>
            <Image {...IMAGE_ATTRS_01} image={image} />
          </Group>
          <Group ref={groupImage2Ref}>
            <Image {...IMAGE_ATTRS_02} image={image2} />
          </Group>
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasGsap;
