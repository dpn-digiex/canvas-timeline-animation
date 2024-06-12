export const DIRECTION = {
  UP: "direction_up",
  DOWN: "direction_down",
  LEFT: "direction_left",
  RIGHT: "direction_right",
};
export const ANIMATION_ID = {
  BASELINE: "baseline",
  WIPE: "wipe",
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
            [DIRECTION.RIGHT]: {
              width: 0,
              offsetX: -defaultProps.width,
              cropX: -defaultProps.cropWidth,
            },
            [DIRECTION.LEFT]: {
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
            [DIRECTION.RIGHT]: {
              width: defaultProps.width,
              cropX: 0,
              offsetX: 0,
            },
            [DIRECTION.LEFT]: {
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
              width: 0,
              offsetX: -defaultProps.width,
              cropX: -defaultProps.cropWidth,
            },
            [DIRECTION.LEFT]: {
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
              cropY: 0,
            },
            [DIRECTION.DOWN]: {
              cropHeight: defaultProps.cropHeight,
            },
            [DIRECTION.RIGHT]: {
              width: defaultProps.width,
              cropX: 0,
              offsetX: 0,
            },
            [DIRECTION.LEFT]: {
              width: defaultProps.width,
              cropX: 0,
              offsetX: 0,
            },
          }[properties?.direction || DIRECTION.UP],
        },
      };
  }
};
