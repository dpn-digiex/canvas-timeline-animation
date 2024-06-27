import { useEffect, useRef, useState } from 'react';
import { Group, Image, Rect } from 'react-konva';
import useImage from 'use-image';
import { useGSAP } from '../GsapProvider';
import { gsap } from 'gsap';
import { ANIMATION_ID, getAnimationEnterConfig, getAnimationExitConfig } from '../animation/config';

const IMAGE_WIDTH_ELEMENT = 300;
const IMAGE_HEIGHT_ELEMENT = 200;

const GROUP_IMAGE_ATTRS_01 = {
  scaleX: 1,
  scaleY: 1,
  opacity: 1,
  offsetX: 0,
  offsetY: 0,
  clipX: 0,
  clipY: 0,
  width: IMAGE_WIDTH_ELEMENT,
  height: IMAGE_HEIGHT_ELEMENT,
  clipWidth: IMAGE_WIDTH_ELEMENT,
  clipHeight: IMAGE_HEIGHT_ELEMENT,
};

const ImageBox = ({ elementIndex, elementAnimation, visible, id, x, y, src, isSelected }) => {
  const [groupPosition, setGroupPosition] = useState({ x: x, y: y });

  const groupRef = useRef(null);
  const imageRef = useRef(null);

  const [image] = useImage(src, 'anonymous');

  const groupAttrs = {
    ...GROUP_IMAGE_ATTRS_01,
    ...groupPosition,
  };
  const imageAttrs = {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    width: IMAGE_WIDTH_ELEMENT,
    height: IMAGE_HEIGHT_ELEMENT,
    image: image,
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
      image: {
        attrs: imageAttrs,
        ref: imageRef.current,
      },
      group: {
        attrs: groupAttrs,
        ref: groupRef.current,
      },
    }[animation?.animationId === ANIMATION_ID.ZOOM ? 'image' : 'group'];

    const animationConfig = getAnimationEnterConfig(animation?.animationId, animateFocus.attrs, properties);
    return gsap.fromTo(animateFocus.attrs, animationConfig.from, {
      ...animationConfig.to,
      id: id,
      immediateRender: false,
      onStart: () => {
        // console.log('start animation of element', elementIndex);
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

  return (
    <Group
      draggable
      ref={groupRef}
      id={id}
      {...groupAttrs}
      onDragMove={handleGroupDragMove}
      {...((preparing || finished) && !animating && { opacity: 0 })}
      visible={visible}
    >
      <Image ref={imageRef} {...imageAttrs} />

      {isSelected && (
        <Rect
          x={-5}
          y={-5}
          width={IMAGE_WIDTH_ELEMENT + 10}
          height={IMAGE_HEIGHT_ELEMENT + 10}
          stroke="blue"
          strokeWidth={15}
        />
      )}
    </Group>
  );
};

export default ImageBox;
