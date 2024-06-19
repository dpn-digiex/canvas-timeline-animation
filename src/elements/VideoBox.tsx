import { useEffect, useRef, useState } from 'react';
import { Group, Image, Rect } from 'react-konva';
import { useGSAP } from '../GsapProvider';
import { gsap } from 'gsap';
import { ANIMATION_ID, getAnimationEnterConfig, getAnimationExitConfig } from '../animation/config';
import Konva from 'konva';

const VIDEO_WIDTH_ELEMENT = 200;
const VIDEO_HEIGHT_ELEMENT = 400;

const GROUP_VIDEO_ATTRS_01 = {
  scaleX: 1,
  scaleY: 1,
  opacity: 1,
  offsetX: 0,
  offsetY: 0,
  clipX: 0,
  clipY: 0,
  width: VIDEO_WIDTH_ELEMENT,
  height: VIDEO_HEIGHT_ELEMENT,
  clipWidth: VIDEO_WIDTH_ELEMENT,
  clipHeight: VIDEO_HEIGHT_ELEMENT,
};

const VideoBox = ({ elementIndex, elementAnimation, id, x, y, src, isSelected }) => {
  const [groupPosition, setGroupPosition] = useState({ x: x, y: y });
  const [videoThubnail, setVideoThumbnail] = useState(null);

  const groupRef = useRef(null);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const statusRef = useRef('loading');

  const groupAttrs = {
    ...GROUP_VIDEO_ATTRS_01,
    ...groupPosition,
  };

  const handleGroupDragMove = (e) => {
    const newPos = e.target.position();
    setGroupPosition({ x: newPos.x, y: newPos.y });
  };

  const { registerTween, updateTween, resetTimeline, triggerUpdateTweens, setUpdatedTweenCount, isTimelineReady } =
    useGSAP();

  const [animating, setAnimating] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [finished, setFinished] = useState(false);

  const layer = imageRef.current?.getLayer();
  const anim = new Konva.Animation(() => {}, layer);

  const imageAttrs = {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    width: VIDEO_WIDTH_ELEMENT,
    height: VIDEO_HEIGHT_ELEMENT,
  };

  const getVideoThumbnail = (video) => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const thumbnailDataUrl = canvas.toDataURL('image/jpeg');
    setVideoThumbnail(thumbnailDataUrl);
  };

  useEffect(() => {
    const video = document.createElement('video');
    const onLoadedMetadata = () => {
      videoRef.current = video;
      videoRef.current.currentTime = 0.0001;
      statusRef.current = 'loaded';
      if (video.readyState >= 1) {
        getVideoThumbnail(video);
      }
    };

    const onError = (err) => {
      statusRef.current = 'error';
      videoRef.current = undefined;
      console.log('LOADING VIDEO ERROR', err);
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('error', onError);

    video.setAttribute('data-canvas', 'video-element');
    video.width = VIDEO_WIDTH_ELEMENT;
    video.height = VIDEO_HEIGHT_ELEMENT;
    video.preload = 'auto';
    video.src = src;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    // video.currentTime = 0.001;
    video.controls = true;
    videoRef.current = video;

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('error', onError);
    };
  }, [src]);

  useEffect(() => {
    return () => {
      // console.log("pause video", id);
      videoRef.current?.pause();
      videoRef.current = undefined;
      anim?.stop();
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

  console.log('videoRef', videoRef.current);
  console.log('videoThumbnail', videoThubnail);
  console.log('status', statusRef.current);

  return statusRef.current === 'loading' ? (
    <Rect width={groupAttrs.width} height={groupAttrs.height} fill="black" x={groupAttrs.x} y={groupAttrs.y} />
  ) : (
    <Group
      draggable
      ref={groupRef}
      id={id}
      {...groupAttrs}
      onDragMove={handleGroupDragMove}
      {...((preparing || finished) && !animating && { opacity: 0 })}
    >
      <Image ref={imageRef} image={videoRef.current} {...imageAttrs} />
      {isSelected && (
        <Rect
          x={-5}
          y={-5}
          width={VIDEO_WIDTH_ELEMENT + 10}
          height={VIDEO_HEIGHT_ELEMENT + 10}
          stroke="orange"
          strokeWidth={15}
        />
      )}
    </Group>
  );
};

export default VideoBox;
