export const DIRECTION = {
  UP: "direction_up",
  DOWN: "direction_down",
  LEFT: "direction_left",
  RIGHT: "direction_right",
};
export const ANIMATION_ID = {
  BASELINE: "baseline",
};
export const getAnimationConfig = (type, defaultProps, properties) => {
  switch (type) {
    case ANIMATION_ID.BASELINE:
      return {
        from: {
          ...defaultProps,
          ...{
            [DIRECTION.UP]: {
              height: 0,
              offsetY: -defaultProps.height,
              cropY: -defaultProps.cropHeight,
            },
            [DIRECTION.DOWN]: {
              height: 0,
              offsetY: defaultProps.height,
              cropY: defaultProps.cropHeight,
            },
            [DIRECTION.LEFT]: {
              clipWidth: 0,
              width: 0,
              offsetX: -defaultProps.width,
            },
            [DIRECTION.RIGHT]: {
              clipWidth: 0,
              width: 0,
              clipX: defaultProps.clipWidth + defaultProps.clipX,
              x: defaultProps.x,
              offsetX: defaultProps.width,
            },
          }[properties?.direction || DIRECTION.UP],
        },
        to: {
          ...defaultProps,
          ...{
            [DIRECTION.UP]: {
              height: defaultProps.height,
              cropY: 0,
              offsetY: 0,
            },
            [DIRECTION.DOWN]: {
              height: defaultProps.height,
              cropY: 0,
              offsetY: 0,
            },
            [DIRECTION.LEFT]: {
              clipWidth: defaultProps.clipWidth,
              width: defaultProps.width,
              offsetX: 0,
            },
            [DIRECTION.RIGHT]: {
              clipWidth: defaultProps.clipWidth,
              width: defaultProps.width,
              clipX: defaultProps.clipX,
              x: defaultProps.x,
              offsetX: 0,
            },
          }[properties?.direction || DIRECTION.UP],
        },
      };
  }
};
