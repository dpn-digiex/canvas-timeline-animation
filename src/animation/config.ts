export const DIRECTION = {
  UP: "direction_up",
  DOWN: "direction_down",
  LEFT: "direction_left",
  RIGHT: "direction_right",
};
export const ANIMATION_ID = {
  BASELINE: "baseline",
  WIPE: "wipe",
  POP: "pop",
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
              width: 0,
              offsetX: -defaultProps.width,
              cropX: -defaultProps.cropWidth,
            },
            [DIRECTION.RIGHT]: {
              width: 0,
              offsetX: defaultProps.width,
              cropX: defaultProps.cropWidth,
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
              width: defaultProps.width,
              cropX: 0,
              offsetX: 0,
            },
            [DIRECTION.RIGHT]: {
              width: defaultProps.width,
              cropX: 0,
              offsetX: 0,
            },
          }[properties?.direction || DIRECTION.UP],
        },
      };
    case ANIMATION_ID.WIPE:
      return {
        from: {
          ...defaultProps,
          ...{
            [DIRECTION.UP]: {
              cropY: defaultProps.cropHeight,
            },
            [DIRECTION.DOWN]: {
              cropHeight: 0,
            },
            [DIRECTION.RIGHT]: {
              cropWidth: 0,
            },
            [DIRECTION.LEFT]: {
              cropX: defaultProps.width,
            },
          }[properties?.direction || DIRECTION.UP],
        },
        to: {
          ...defaultProps,
          ...{
            [DIRECTION.UP]: {
              cropY: 0,
            },
            [DIRECTION.DOWN]: {
              cropHeight: defaultProps.cropHeight,
            },
            [DIRECTION.RIGHT]: {
              cropWidth: defaultProps.cropWidth,
            },
            [DIRECTION.LEFT]: {
              cropX: 0,
            },
          }[properties?.direction || DIRECTION.UP],
        },
      };
    case ANIMATION_ID.POP:
      return {
        from: {
          scaleX: 0.5,
          scaleY: 0.5,
        },
        to: {
          scaleX: 1,
          scaleY: 1,
        },
      };
  }
};
