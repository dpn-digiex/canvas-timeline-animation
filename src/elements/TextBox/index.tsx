import { useEffect, useRef, useState } from 'react';
import { Text, Group, Rect } from 'react-konva';
import gsap from 'gsap';
import { GSDevTools } from 'gsap/GSDevTools';
import { CustomEase } from 'gsap/CustomEase';
import { ANIMATION_ID, TYPE_WRITING, getAnimationEnterConfig } from '../../animation/config';
import { useGSAP } from '../../GsapProvider';
import WordAnimation from './WordAnimation';
import CharacterAnimation from './CharacterAnimation';

import { calcMaskUpdateAttr, calculateMaskGradientAngle } from '../../utils/textHelper';

gsap.registerPlugin(CustomEase, GSDevTools);

export const TEXT_ALIGNMENTS = {
  CENTER: 'center',
  RIGHT: 'right',
  JUSTIFY: 'justify',
};

const textProps = {
  id: '4306eab6-148b-49c6-a089-618fcb0dcd86',
  elementId: '',
  type: 'text',
  elementType: 'body',
  name: '',
  src: '',
  borderColor: '',
  text: 'Welcome to Obello!',
  width: 600,
  height: 68,
  groupId: null,
  x: 0,
  y: 0,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  opacity: 1,
  cropWidth: 1,
  cropHeight: 1,
  cropX: 0,
  cropY: 0,
  fontSize: 72,
  visible: true,
  padding: {
    paddingRight: true,
    paddingLeft: true,
    paddingTop: true,
    paddingBottom: true,
    horizontal: 0,
    vertical: 0,
  },
  fill: 'transparent',
  align: 'left',
  fontStyle: 'normal',
  letterSpacing: 0,
  lineHeight: 1,
  textTransform: 'sentenceCase',
  textDecoration: '',
  strokeWidth: 0,
  cornerRadius: null,
  cornerRadiusTopLeft: 0,
  cornerRadiusTopRight: 0,
  cornerRadiusBottomLeft: 0,
  cornerRadiusBottomRight: 0,
  textFill: '#161616',
  fontFamily: 'Instrument Sans',
  fontId: '2b503fd317914e019b2ffd2917582b83',
  s3FilePath:
    'https://stg-template-static.obello.com/640ff35bb49f034bb2e80766/Editor/db58ee48a3e746d390a3086425e896db/2b503fd317914e019b2ffd2917582b83.ttf',
  category: '',
  paddingRatio: 1,
  listening: true,
  index: 0,
  scaleX: 1,
  scaleY: 1,
  fillPatternScaleX: 1,
  fillPatternScaleY: 1,
  svgElement: null,
  imageWidth: null,
  imageHeight: null,
  mute: false,
  autoFitEnabled: true,
  shadowEnabled: true,
  shadowColor: 'undefined',
  shadowBlur: 30,
  shadowOpacity: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  language: 'English',
  radiusEnabled: false,
  enableWaterMark: false,
};

const textAttrs = {
  letterSpacing: textProps?.letterSpacing,
  lineHeight: textProps?.lineHeight,
  fontStyle: textProps?.fontStyle,
  textTransform: textProps?.textTransform,
  textDecoration: textProps?.textDecoration,
  text: textProps?.text,
  fontSize: textProps.fontSize,
  autoFitEnabled: true,
  fill: textProps?.textFill,
  align: textProps?.align,
  x: 0,
  y: 0,
  width: textProps.width,
  height: textProps.height,
  verticalAlign: 'top',
  fontFamily: textProps.fontFamily,
  opacity: textProps.opacity,
};

const GROUP_TEXT_ATTRS_01 = {
  scaleX: 1,
  scaleY: 1,
  opacity: 1,
  offsetX: 0,
  offsetY: 0,
  clipX: 0,
  clipY: 0,
  width: textProps.width,
  height: textProps.height,
  clipWidth: textProps.width,
  clipHeight: textProps.height,
};

const TextBox = ({ elementIndex, elementAnimation, id, x, y, isSelected, visible }) => {
  const { id: elementId } = textProps;
  const textRef = useRef();
  const groupRef = useRef();
  const maskRef = useRef();
  const maskAttrs = {
    width: textProps.width,
    height: textProps.height,
    x: textProps.x,
    y: textProps.y,
  };
  const { x1, y1, x2, y2 } = calculateMaskGradientAngle(maskAttrs, elementAnimation?.direction);
  const [groupPosition, setGroupPosition] = useState({ x: x, y: y });

  const handleGroupDragMove = (e) => {
    const newPos = e.target.position();
    setGroupPosition({ x: newPos.x, y: newPos.y });
  };

  const groupAttrs = {
    ...GROUP_TEXT_ATTRS_01,
    ...groupPosition,
  };
  const { registerTween, updateTween, resetTimeline, triggerUpdateTweens, setUpdatedTweenCount, isTimelineReady } =
    useGSAP();
  const [animating, setAnimating] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [finished, setFinished] = useState(false);
  const firstInit = useRef(true);

  useEffect(() => {
    if (
      isTimelineReady &&
      elementAnimation?.typeWriting != TYPE_WRITING.CHARACTER &&
      elementAnimation?.typeWriting != TYPE_WRITING.WORD
    ) {
      firstInit.current = false;
      const tween = createTweenEnter(elementAnimation);
      registerTween(tween, elementIndex * 0.2);
    }
  }, [isTimelineReady]);

  useEffect(() => {
    if (
      !firstInit.current &&
      triggerUpdateTweens &&
      elementAnimation?.typeWriting != TYPE_WRITING.CHARACTER &&
      elementAnimation?.typeWriting != TYPE_WRITING.WORD
    ) {
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
      text: {
        attrs: { ...textAttrs },
        ref: textRef.current,
      },
      group: {
        attrs: { ...groupAttrs },
        ref: groupRef.current,
      },
    }[animation?.animationId === ANIMATION_ID.REVEAL ? 'text' : 'group'];
    const animationConfig = getAnimationEnterConfig(animation?.animationId, animateFocus.attrs, properties);
    return gsap.fromTo(
      animateFocus.attrs,
      { ...animationConfig.from },
      {
        ...animationConfig.to,
        id: id,
        immediateRender: false,

        onStart: () => {
          setPreparing(false);
          setAnimating(true);
        },
        onUpdate: () => {
          animateFocus.ref.setAttrs(animateFocus.attrs);

          if (elementAnimation?.animationId === ANIMATION_ID.REVEAL) {
            maskRef.current.setAttrs({
              ...maskAttrs,
              opacity: 1,
              ...calcMaskUpdateAttr(textAttrs, animateFocus.attrs, elementAnimation?.direction),
            });
          }
        },
        onComplete: () => {
          animateFocus.ref.setAttrs(animateFocus.attrs);

          if (elementAnimation?.animationId === ANIMATION_ID.REVEAL) {
            maskRef.current.setAttrs({ ...maskAttrs, opacity: 0 });
          }

          setAnimating(false);
        },
      },
    );
  };

  // const createTweenExit = (animation) => {
  //   const properties = {
  //     direction: animation?.direction,
  //     scale: animation?.scale,
  //     duration: animation?.speed,
  //   };
  //   const animateFocus = {
  //     attrs: groupAttrs,
  //     ref: groupRef.current,
  //   };

  //   const animationConfig = getAnimationExitConfig(animation?.animationId, animateFocus.attrs, properties);
  //   return gsap.fromTo(animateFocus.attrs, animationConfig.from, {
  //     ...animationConfig.to,
  //     id: id,
  //     immediateRender: false,
  //     onStart: () => {
  //       // console.log('start animation of element', elementIndex);
  //       setAnimating(true);
  //     },
  //     onUpdate: () => {
  //       animateFocus.ref.setAttrs(animateFocus.attrs);
  //     },
  //     onComplete: () => {
  //       animateFocus.ref.setAttrs(animateFocus.attrs);
  //       setFinished(true);
  //       setAnimating(false);
  //     },
  //   });
  // };
  return (
    <Group
      draggable
      ref={groupRef}
      id={id}
      {...groupAttrs}
      onDragMove={handleGroupDragMove}
      visible={visible}
      {...((preparing || finished) && !animating && { opacity: 0 })}
    >
      {/*Static Text*/}
      <Text
        ref={textRef}
        {...textAttrs}
        opacity={
          elementAnimation?.typeWriting === TYPE_WRITING.CHARACTER ||
          elementAnimation?.typeWriting === TYPE_WRITING.WORD
            ? 0
            : 1
        }
        id={`text-${elementId}`}
      />
      {/* {elementAnimation?.animationId === 'reveal' && (
        <MaskAnimation
          textProps={textProps}
          textAttrs={textAttrs}
          animation={elementAnimation}
          visible={true}
          elementIndex={elementIndex}
          id={elementId}
        />
      )} */}
      {elementAnimation?.typeWriting === TYPE_WRITING.WORD && (
        <WordAnimation
          animating={animating}
          preparing={preparing}
          finished={finished}
          setAnimating={setAnimating}
          setPreparing={setPreparing}
          setFinished={setFinished}
          textProps={textProps}
          textAttrs={textAttrs}
          textRef={textRef}
          animation={elementAnimation}
          visible={true}
          elementIndex={elementIndex}
          id={id}
        />
      )}
      {elementAnimation?.typeWriting === TYPE_WRITING.CHARACTER && (
        <CharacterAnimation
          animating={animating}
          preparing={preparing}
          finished={finished}
          setAnimating={setAnimating}
          setPreparing={setPreparing}
          setFinished={setFinished}
          textProps={textProps}
          textAttrs={textAttrs}
          textRef={textRef}
          animation={elementAnimation}
          visible={true}
          elementIndex={elementIndex}
          id={id}
        />
      )}
      {elementAnimation?.animationId === ANIMATION_ID.REVEAL && (
        <Rect
          ref={maskRef}
          name="transparentBackground"
          {...maskAttrs}
          fillPriority="linear-gradient"
          fillLinearGradientStartPoint={{ x: x1, y: y1 }}
          fillLinearGradientEndPoint={{ x: x2, y: y2 }}
          fillLinearGradientColorStops={[0, 'rgb(239,239,239,0 )', 0.3, 'rgb(239,239,239,1 )']}
          opacity={0}
          {...(animating && { opacity: 1 })}
        />
      )}

      {isSelected && (
        <Rect
          x={-5}
          y={-5}
          width={textProps.width + 10}
          height={textProps.height + 10}
          stroke="orange"
          strokeWidth={15}
        />
      )}
    </Group>
  );
};

export default TextBox;
