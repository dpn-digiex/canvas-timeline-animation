import { useEffect, useRef, useState } from 'react';
import { Group, Image, Rect } from 'react-konva';
import useImage from 'use-image';
import { useGSAP } from '../GsapProvider';
import { gsap } from 'gsap';
import { ANIMATION_ID, getAnimationConfig } from '../animation/config';

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

const ImageBox = ({ elementIndex, elementAnimation, id, x, y, src, isSelected }) => {
  const [groupPosition, setGroupPosition] = useState({ x: x, y: y });

  const groupRef = useRef(null);
  const imageRef = useRef(null);

  const [image] = useImage(src);

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
      const tween = createTween(elementAnimation);
      registerTween(tween, elementIndex * 0.2);
    }
  }, [isTimelineReady]);

  useEffect(() => {
    if (!firstInit.current && triggerUpdateTweens) {
      resetTimeline();
      const tween = createTween(elementAnimation);
      updateTween(id, tween);
      setUpdatedTweenCount((prev) => prev + 1);
    }
  }, [triggerUpdateTweens]);

  const createTween = (animation) => {
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

    const animationConfig = getAnimationConfig(animation?.animationId, animateFocus.attrs, properties);
    return gsap.fromTo(animateFocus.attrs, animationConfig.from, {
      ...animationConfig.to,
      id: id,
      onStart: () => {
        // console.log('start animation of element', elementIndex);
      },
      onUpdate: () => {
        if (animateFocus.ref) {
          animateFocus.ref.setAttrs(animateFocus.attrs);
        }
      },
      onComplete: () => {
        animateFocus.ref.setAttrs(animateFocus.attrs);
      },
      immediateRender: false,
    });
  };

  return (
    <Group draggable ref={groupRef} id={id} {...groupAttrs} onDragMove={handleGroupDragMove}>
      <Image ref={imageRef} {...imageAttrs} />
      {isSelected && (
        <Rect
          x={-5}
          y={-5}
          width={IMAGE_WIDTH_ELEMENT + 10}
          height={IMAGE_HEIGHT_ELEMENT + 10}
          stroke="orange"
          strokeWidth={15}
        />
      )}
    </Group>
  );
};

export default ImageBox;
