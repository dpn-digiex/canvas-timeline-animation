import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Text, Group } from 'react-konva';
import gsap from 'gsap';
import { GSDevTools } from 'gsap/GSDevTools';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '../GsapProvider';
import { getAnimationConfig } from '../animation/config';

gsap.registerPlugin(CustomEase, GSDevTools);
const TEXT_WIDTH_ELEMENT = 300;
const TEXT_HEIGHT_ELEMENT = 200;

const GROUP_TEXT_ATTRS_01 = {
  scaleX: 1,
  scaleY: 1,
  opacity: 1,
  offsetX: 0,
  offsetY: 0,
  clipX: 0,
  clipY: 0,
  width: TEXT_WIDTH_ELEMENT,
  height: TEXT_HEIGHT_ELEMENT,
  clipWidth: TEXT_WIDTH_ELEMENT,

  clipHeight: TEXT_HEIGHT_ELEMENT,
};

const TestText = ({ elementIndex, elementAnimation, id, x, y }) => {
  const wordRefs = useRef([]);
  const [groupPosition, setGroupPosition] = useState({ x: x, y: y });
  const { registerTween, updateTween, resetTimeline, triggerUpdateTweens, setUpdatedTweenCount, isTimelineReady } =
    useGSAP();
  const handleGroupDragMove = (e) => {
    const newPos = e.target.position();
    setGroupPosition({ x: newPos.x, y: newPos.y });
  };

  const groupAttrs = {
    ...GROUP_TEXT_ATTRS_01,
    ...groupPosition,
  };
  const wordAttributes = [
    { x: 0, y: 100, scaleX: 1, scaleY: 1, text: 'Tân' },
    { x: 60, y: 100, scaleX: 1, scaleY: 1, text: 'Phạm' },
  ];
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
    return gsap.fromTo(
      wordRefs.current,
      { opacity: 1, y: -50 },
      {
        opacity: 1,
        y: 50,
        stagger: {
          amount: 1,
        },
      },
    );
  };
  // useEffect(() => {
  //   if (wordRefs.current.length === 0) return;
  //   wordRefs.current.forEach((charRef) => {
  //     const size = charRef.getSelfRect();
  //     console.log(size);
  //   });

  //   // const tl = gsap.timeline({ defaults: { duration: 1, ease: 'power2.out' } });

  //   // tl.fromTo(
  //   //   wordRefs.current,
  //   //   { opacity: 0, y: -50 },
  //   //   {
  //   //     opacity: 1,
  //   //     y: 50,
  //   //     stagger: {
  //   //       amount: 1,
  //   //     },
  //   //   },
  //   // );
  //   // tl.fromTo(
  //   //   charRefs.current,
  //   //   { opacity: 0 },
  //   //   {
  //   //     opacity: 1,
  //   //     stagger: {
  //   //       amount: 1,
  //   //     },
  //   //   },
  //   // );
  //   // tl.fromTo(
  //   //   charRefs2.current,
  //   //   {
  //   //     scaleX: 0,
  //   //     scaleY: 0,
  //   //   },
  //   //   {
  //   //     scaleX: 1,
  //   //     scaleY: 1,
  //   //     ease: CustomEase.create('custom', 'M0,0 C0.078,0.153 0.336,1.065 0.665,1.299 0.774,1.376 0.873,1 1,1 '),
  //   //     stagger: {
  //   //       amount: 1,
  //   //     },
  //   //   },
  //   // );

  //   GSDevTools.create();
  // }, []);

  return (
    <Group draggable {...groupAttrs} onDragMove={handleGroupDragMove}>
      {wordAttributes.map((attr, index) => (
        <Text key={index} ref={(el) => (wordRefs.current[index] = el)} {...attr} fontSize={30} />
      ))}
    </Group>
  );
};

export default TestText;
