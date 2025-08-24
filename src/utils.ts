import Whammy from 'react-whammy';
import { ANIMATION_ID } from './animation/config';

export const createVideoFromFrames = (frames, fps = 30) => {
  return new Promise((resolve, reject) => {
    try {
      const whammy = new Whammy.Video(fps);
      const imagePromises = frames.map((frame) => {
        return new Promise((resolve, reject) => {
          if (typeof frame === 'string' && frame.startsWith('data:image/')) {
            resolve(frame);
          } else {
            const img = new Image();
            img.src = frame;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.width = img.width;
              canvas.height = img.height;
              context.drawImage(img, 0, 0);
              const dataURI = canvas.toDataURL('image/webp');
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

export const downloadVideo = async (frames, filename) => {
  const videoUrl = await createVideoFromFrames(frames);
  console.log("videoUrl", videoUrl);

  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = videoUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(videoUrl);
};

export const calculateStartTimePage = (pageId: string, availablePages: any) => {
  if (availablePages?.length === 0 || !availablePages) return 0;
  let startTime = 0;
  for (let i = 0; i < availablePages?.length; i++) {
    if (availablePages[i].id === pageId) break;
    startTime += availablePages?.[i]?.duration || 0; // Use optional chaining
  }
  return +startTime.toFixed(0);
};

export const calculateEndTimePage = (pageId: string, availablePages: any) => {
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

export const calculateTimeout = (elementsApplied = []) => {
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
