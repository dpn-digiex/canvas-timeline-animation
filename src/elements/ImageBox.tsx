import { useEffect, useRef, useState } from 'react';
import { Group, Image } from 'react-konva';
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

const ImageBox = ({ x, y, src }) => {
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

  const { registerTween, resetTimeline, animationId, direction, isTimelineReady } = useGSAP();

  useEffect(() => {
    if (isTimelineReady) {
      resetTimeline();
      const properties = { direction, duration: 1.5 };
      const animateFocus = {
        image: {
          attrs: imageAttrs,
          ref: imageRef.current,
        },
        group: {
          attrs: groupAttrs,
          ref: groupRef.current,
        },
      }[animationId === ANIMATION_ID.ZOOM ? 'image' : 'group'];
      const animationConfig = getAnimationConfig(animationId, animateFocus.attrs, properties);
      const tween = gsap.fromTo(animateFocus.attrs, animationConfig.from, {
        ...animationConfig.to,
        onUpdate: () => {
          if (animateFocus.ref) {
            animateFocus.ref.setAttrs(animateFocus.attrs);
          }
        },
        onComplete: () => {
          animateFocus.ref.setAttrs({ offsetX: 0, offsetY: 0 });
        },
      });
      registerTween(tween);
    }
  }, [isTimelineReady, animationId, direction]);

  return (
    <Group draggable ref={groupRef} {...groupAttrs} onDragMove={handleGroupDragMove}>
      <Image ref={imageRef} {...imageAttrs} />
    </Group>
  );
};

export default ImageBox;
