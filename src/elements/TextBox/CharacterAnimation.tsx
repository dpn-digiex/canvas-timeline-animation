import React, { memo, useEffect, useRef, useState } from 'react';
import { Group, Shape, Text } from 'react-konva';
import gsap from 'gsap';
import { GSDevTools } from 'gsap/GSDevTools';

import { getAnimationEnterConfig } from '../../animation/config';
import { useGSAP } from '../../GsapProvider';
import { getTokensInString, textMesureSize } from '../../utils/textHelper';
import { TEXT_ALIGNMENTS } from '.';
gsap.registerPlugin(GSDevTools);

const CharacterAnimation = ({
  animating,
  setAnimating,
  finished,
  setFinished,
  preparing,
  setPreparing,
  textProps,
  textAttrs,
  textRef,
  animation,
  visible,
  elementIndex,
  id,
}) => {
  const { registerTween, updateTween, resetTimeline, triggerUpdateTweens, setUpdatedTweenCount, isTimelineReady } =
    useGSAP();
  // Ref for animation
  const characterRefs = useRef([]);
  const firstInit = useRef(true);

  const [textBreak, setTextBreak] = useState([]);
  const textElement = textRef.current;
  const isCTA = false;
  const textArr = textElement?.textArr;
  const textHeight = textElement ? textElement.height() : 0;
  const lineHeight = textElement ? textElement.lineHeight() * textElement.fontSize() : 0;

  const paddingTop = isCTA ? (textHeight - lineHeight * textArr.length) / 2 : 0;
  const _calcTextsPosition = () => {
    if (!textElement || Object.keys(textElement).length === 0) return;
    let arrText = [];

    textArr.forEach((textLine, index) => {
      let lineWidth = 0;
      let wordSpacing = 0;
      switch (textProps.align) {
        case TEXT_ALIGNMENTS.CENTER:
          lineWidth = (textAttrs.width - textLine.width) * 0.5;
          break;
        case TEXT_ALIGNMENTS.RIGHT:
          lineWidth = textAttrs.width - textLine.width;
          break;
        case TEXT_ALIGNMENTS.JUSTIFY:
          const words = getTokensInString(textLine.text);
          wordSpacing = index === textArr.length - 1 ? 0 : (textAttrs.width - textLine.width) / (words.length - 1);
          break;
        default:
          break;
      }
      const characters = textLine.text.split('');
      characters.forEach((char) => {
        const { width: measureTextWidth } = textElement.measureSize([char]);
        const textWidth = char === ' ' ? wordSpacing + measureTextWidth : measureTextWidth + textAttrs.letterSpacing;
        const textData = {
          x: lineWidth,
          y: index * lineHeight + paddingTop,
          text: char,
        };
        lineWidth += textWidth;
        arrText = [...arrText, textData];
      });
    });
    setTextBreak(arrText);
  };

  useEffect(() => {
    _calcTextsPosition();
  }, [textAttrs, textRef?.current, textProps]);

  useEffect(() => {
    if (isTimelineReady) {
      firstInit.current = false;
      const tween = createTweenEnter(animation);
      updateTween(id, tween);

      registerTween(tween, elementIndex * 0.2);
    }
  }, [isTimelineReady]);

  useEffect(() => {
    if (!firstInit.current && triggerUpdateTweens) {
      resetTimeline();
      const tween = createTweenEnter(animation);
      updateTween(id, tween);
      setUpdatedTweenCount((prev) => prev + 1);
    }
  }, [triggerUpdateTweens]);

  const characterAttributes = textBreak?.map((item) => {
    return {
      ...item,
      scaleX: 1,
      scaleY: 1,
    };
  });
  const createTweenEnter = (animation) => {
    const properties = {
      direction: animation?.direction,
      scale: animation?.scale,
      duration: animation?.speed,
    };
    const animationAttrs = {
      opacity: textAttrs.opacity,
      offsetX: 0,
      offsetY: 0,
      scaleX: 1,
      scaleY: 1,
      fontSize: textAttrs.fontSize,
      // burst: 0,
    };

    const animationConfig = getAnimationEnterConfig(animation?.animationId, animationAttrs, properties);
    return gsap.fromTo(
      characterRefs.current,
      {
        ...animationConfig.from,
      },
      {
        ...animationConfig.to,
        id: id,
        onStart: () => {
          setPreparing(false);
          setAnimating(true);
        },
        onUpdate: () => {
          // characterRefs.current.map((item, index) => item.setAttrs(characterAttributes[index]));
        },
        onComplete: () => {
          // characterRefs.current.map((item, index) => item.setAttrs(characterAttributes[index]));
          setAnimating(false);
        },
      },
    );
  };
  return visible ? (
    <>
      {characterAttributes.map((attr, index) => (
        <Text
          key={index}
          ref={(el) => (characterRefs.current[index] = el)}
          {...attr}
          fontFamily={textProps.fontFamily}
          fontSize={textProps.fontSize}
          {...((preparing || finished) && !animating && { opacity: 0 })}
        />
      ))}
    </>
  ) : null;
};

export default CharacterAnimation;
