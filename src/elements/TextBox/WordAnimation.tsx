import React, { memo, useEffect, useRef, useState } from 'react';
import { Group, Shape, Text } from 'react-konva';
import gsap from 'gsap';
import { GSDevTools } from 'gsap/GSDevTools';

import { getAnimationEnterConfig } from '../../animation/config';
import { useGSAP } from '../../GsapProvider';
import { getTokensInString, textMesureSize } from '../../utils/textHelper';
gsap.registerPlugin(GSDevTools);

const WordAnimation = ({
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
  const wordRefs = useRef([]);
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
      const words = getTokensInString(textLine.text);
      let lineWidth = 0;
      let wordSpacing = 0;

      words.forEach((_word, _index) => {
        const word = `${_word}${_index < words.length - 1 ? ' ' : ''}`;
        const textWidth = textMesureSize(textRef, { ...textAttrs, text: word });
        const textData = {
          x: lineWidth,
          y: index * lineHeight + paddingTop,
          text: word,
          length: word.length,
        };
        lineWidth += textWidth + wordSpacing;
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

  const wordAttributes = textBreak?.map((item) => {
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
      fontSize: textAttrs.fontSize,
    };
    const animationConfig = getAnimationEnterConfig(animation?.animationId, animationAttrs, properties);
    return gsap.fromTo(
      wordRefs.current,
      { ...animationConfig.from },
      {
        ...animationConfig.to,
        id: id,
        onStart: () => {
          setPreparing(false);
          setAnimating(true);
        },
        onUpdate: () => {
          // wordRef.current.map((item, index) => item.setAttrs(characterAttributes[index]));
        },
        onComplete: () => {
          // wordRef.current.map((item, index) => item.setAttrs(characterAttributes[index]));
          setAnimating(false);
        },
      },
    );
  };
  return visible ? (
    <>
      {wordAttributes.map((attr, index) => (
        <Text
          key={index}
          ref={(el) => (wordRefs.current[index] = el)}
          {...attr}
          fontFamily={textProps.fontFamily}
          fontSize={textProps.fontSize}
          {...((preparing || finished) && !animating && { opacity: 0 })}
        />
      ))}
    </>
  ) : null;
};

export default WordAnimation;
