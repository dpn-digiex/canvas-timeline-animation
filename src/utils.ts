import Whammy from 'react-whammy';

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