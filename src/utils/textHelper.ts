import { DIRECTION } from '../animation/config';

export const getTokensInString = (text) => {
  if (typeof text === 'string') {
    let result = [];
    const tokens = text.split(/\s+/);
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].length > 0) {
        result = [...result, tokens[i]];
      }
    }
    return result;
  }
  return [];
};

export const textMesureSize = (textRef, textProps) => {
  const textElement = textRef.current || {};

  if (Object.keys(textElement).length === 0) return 0;
  const { letterSpacing, text } = textProps;
  let textWidth = 0;
  const characters = text.split('');
  characters.forEach((char) => {
    const { width: measureTextWidth } = textElement.measureSize([char]);
    textWidth += measureTextWidth + letterSpacing;
  });
  return textWidth;
};

export const calculateMaskGradientAngle = (maskAttrs: any, direction?: string = DIRECTION.RIGHT) => {
  // Compute angle in radians - CSS starts from 180 degrees and goes clockwise
  // Math functions start from 0 and go anti-clockwise so we use 180 - angleInDeg to convert between the two
  let angleDeg = 0;
  if (direction === DIRECTION.LEFT) angleDeg = 90;
  if (direction === DIRECTION.UP) angleDeg = 0;
  if (direction === DIRECTION.RIGHT) angleDeg = -90;
  if (direction === DIRECTION.DOWN) angleDeg = 180;
  const angleRad = (angleDeg * Math.PI) / 180;

  // This computes the length such that the start/stop points will be at the corners
  const length = Math.abs(maskAttrs.width * Math.sin(angleRad)) + Math.abs(maskAttrs.height * Math.cos(angleRad));

  // Compute the actual x,y points based on the angleRad, length of the gradient line and the center of the div
  const halfx = (Math.sin(angleRad) * length) / 2.0;
  const halfy = (Math.cos(angleRad) * length) / 2.0;
  const cx = maskAttrs.width / 2.0;
  const cy = maskAttrs.height / 2.0;
  const x1 = cx - halfx;
  const y1 = cy - halfy;
  const x2 = cx + halfx;
  const y2 = cy + halfy;

  return { x1, y1, x2, y2 };
};

export const calcMaskUpdateAttr = (defaultAttrs: any, animatingAttrs: any, direction: string) => {
  if (direction === DIRECTION.LEFT) {
    return {
      x: 0.7 * defaultAttrs.width - animatingAttrs.x,
    };
  } else if (direction === DIRECTION.UP) {
    return {
      y: 0.7 * defaultAttrs.height - animatingAttrs.y,
    };
  } else if (direction === DIRECTION.RIGHT) {
    return {
      x: -0.7 * defaultAttrs.width - animatingAttrs.x,
    };
  } else if (direction === DIRECTION.DOWN) {
    return {
      y: -0.7 * defaultAttrs.height - animatingAttrs.y,
    };
  }
};
