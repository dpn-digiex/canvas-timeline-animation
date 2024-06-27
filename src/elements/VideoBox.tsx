import { useEffect, useMemo, useRef, useState } from 'react';
import { Group, Image, Rect } from 'react-konva';
import { useGSAP } from '../GsapProvider';
import { gsap } from 'gsap';
import { ANIMATION_ID, getAnimationEnterConfig, getAnimationExitConfig } from '../animation/config';
import Konva from 'konva';

const GROUP_VIDEO_ATTRS_01 = {
  scaleX: 1,
  scaleY: 1,
  opacity: 1,
  offsetX: 0,
  offsetY: 0,
  clipX: 0,
  clipY: 0,
};

const VideoBox = ({
  elementIndex,
  elementAnimation,
  id,
  x,
  y,
  src,
  width,
  height,
  isSelected,
  visible,
  isExportVideo,
  currentTimeCapture,
}) => {
  const [groupPosition, setGroupPosition] = useState({ x: x, y: y });
  const [videoAttrs, setVideoAttrs] = useState({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    width: width,
    height: width,
  });

  const groupRef = useRef(null);
  const imageRef = useRef(null);
  const statusRef = useRef('loading');

  const groupAttrs = {
    width: width,
    height: height,
    clipWidth: width,
    clipHeight: height,
    ...GROUP_VIDEO_ATTRS_01,
    ...groupPosition,
  };

  const handleGroupDragMove = (e) => {
    const newPos = e.target.position();
    setGroupPosition({ x: newPos.x, y: newPos.y });
  };

  const {
    elapsedTime,
    registerTween,
    updateTween,
    resetTimeline,
    triggerUpdateTweens,
    setUpdatedTweenCount,
    isTimelineReady,
    isPlayingTimeline,
    setReadyNextFrame,
  } = useGSAP();

  const [animating, setAnimating] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [finished, setFinished] = useState(false);

  const videoElement = useMemo(() => {
    const element = document.createElement('video');
    element.src = src;
    element.crossOrigin = 'anonymous';
    element.muted = true;
    element.preload = '';
    element.width = width;
    element.height = height;
    element.setAttribute('data-canvas', 'video-element');
    return element;
  }, [src]);

  const getVideoThumbnail = (video) => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const thumbnailDataUrl = canvas.toDataURL('image/jpeg');
    videoElement.poster = thumbnailDataUrl;
  };

  useEffect(() => {
    const onload = function () {
      statusRef.current = 'loaded';
      videoElement.currentTime = 0.001;
      if (videoElement.readyState >= 1) {
        getVideoThumbnail(videoElement);
      }
    };

    const onError = (err) => {
      statusRef.current = 'error';
      console.log('LOADING VIDEO ERROR', err);
    };

    const onTimeUpdate = () => {
      // console.log('can play video');
      setReadyNextFrame(true);
    };

    const onWaiting = () => {
      console.log("video's waiting for data");
      setReadyNextFrame(false);
    };

    videoElement.addEventListener('loadedmetadata', onload);
    videoElement.addEventListener('error', onError);
    videoElement.addEventListener('timeupdate', onTimeUpdate);
    videoElement.addEventListener('waiting', onWaiting);
    videoElement.addEventListener('stalled', () => console.log('stalled'));

    return () => {
      videoElement.removeEventListener('loadedmetadata', onload);
      videoElement.removeEventListener('error', onError);
      videoElement.removeEventListener('timeupdate', onTimeUpdate);
      videoElement.removeEventListener('waiting', onWaiting);
    };
  }, [videoElement]);

  useEffect(() => {
    if (videoElement && imageRef.current) {
      const layer = imageRef.current.getLayer();
      const anim = new Konva.Animation(() => {}, layer);
      if (isPlayingTimeline) {
        videoElement.currentTime = elapsedTime;
        videoElement.play();
        anim.start();
      } else {
        videoElement.pause();
      }
      return () => {
        anim.stop();
      };
    }
  }, [videoElement, isPlayingTimeline]);

  useEffect(() => {
    if (!isPlayingTimeline) {
      videoElement.currentTime = currentTimeCapture;
    }
  }, [currentTimeCapture]);

  useEffect(() => {
    return () => {
      videoElement.pause();
      videoElement.src = '';
      videoElement.load();
    };
  }, []);

  const firstInit = useRef(true);
  useEffect(() => {
    if (isTimelineReady) {
      firstInit.current = false;
      const tween = createTweenEnter(elementAnimation);
      registerTween(tween, elementIndex * 0.2);
    }
  }, [isTimelineReady]);

  useEffect(() => {
    if (!firstInit.current && triggerUpdateTweens) {
      resetTimeline();
      setPreparing(true);
      const tween = createTweenEnter(elementAnimation);
      updateTween(id, tween);
      setUpdatedTweenCount((prev) => prev + 1);
    }
  }, [triggerUpdateTweens]);

  const createTweenEnter = (animation) => {
    const properties = {
      direction: animation?.direction,
      scale: animation?.scale,
      duration: animation?.speed,
    };
    const animateFocus = {
      video: {
        attrs: groupAttrs,
        ref: imageRef.current,
      },
      group: {
        attrs: groupAttrs,
        ref: groupRef.current,
      },
    }[animation?.animationId === ANIMATION_ID.ZOOM ? 'video' : 'group'];

    const animationConfig = getAnimationEnterConfig(animation?.animationId, animateFocus.attrs, properties);
    return gsap.fromTo(animateFocus.attrs, animationConfig.from, {
      ...animationConfig.to,
      id: id,
      immediateRender: false,
      onStart: () => {
        setPreparing(false);
        setAnimating(true);
      },
      onUpdate: () => {
        animateFocus.ref.setAttrs(animateFocus.attrs);
      },
      onComplete: () => {
        animateFocus.ref.setAttrs(animateFocus.attrs);
        setAnimating(false);
      },
    });
  };

  const createTweenExit = (animation) => {
    const properties = {
      direction: animation?.direction,
      scale: animation?.scale,
      duration: animation?.speed,
    };
    const animateFocus = {
      attrs: groupAttrs,
      ref: groupRef.current,
    };

    const animationConfig = getAnimationExitConfig(animation?.animationId, animateFocus.attrs, properties);
    return gsap.fromTo(animateFocus.attrs, animationConfig.from, {
      ...animationConfig.to,
      id: id,
      immediateRender: false,
      onStart: () => {
        setAnimating(true);
      },
      onUpdate: () => {
        animateFocus.ref.setAttrs(animateFocus.attrs);
      },
      onComplete: () => {
        animateFocus.ref.setAttrs(animateFocus.attrs);
        setFinished(true);
        setAnimating(false);
      },
    });
  };

  return statusRef.current === 'loading' ? (
    <Rect width={groupAttrs.width} height={groupAttrs.height} fill="black" x={groupAttrs.x} y={groupAttrs.y} />
  ) : (
    <Group
      draggable
      ref={groupRef}
      id={id}
      {...groupAttrs}
      onDragMove={handleGroupDragMove}
      visible={visible}
      // {...((preparing || finished) && !animating && { opacity: 0 })}
    >
      <Image ref={imageRef} image={videoElement} {...videoAttrs} />
      {isSelected && <Rect x={-5} y={-5} width={width + 10} height={width + 10} stroke="blue" strokeWidth={15} />}
    </Group>
  );
};

export default VideoBox;
