import { Power3 } from "gsap";

export const DIRECTION = {
  UP: "direction_up",
  DOWN: "direction_down",
  LEFT: "direction_left",
  RIGHT: "direction_right",
};

export const ANIMATION_ID = {
  NONE: "none",
  FADE: "fade",
  WIPE: "wipe",
  BASELINE: "baseline",
  RISE: "rise",
  PAN: "pan",
  POP: "pop",
  ZOOM: "zoom",
  NEON: "neon",
  BREATH: "breath",
  TYPEWRITER: "typewriter",
  ASCEND: "ascend",
};

export const ANIMATION_ANIMATE = {
  BOTH: "both",
  ENTER: "enter",
  EXIT: "exit",
  ENTER_BOTH: ["enter", "both"],
  EXIT_BOTH: ["exit", "both"],
};

export const ANIMATION_SCALE = {
  IN: "scale_in",
  OUT: "scale_out",
};

export const TYPE_WRITING = {
  ELEMENT: "ELEMENT",
  WORD: "WORD",
  CHARACTER: "CHARACTER",
};

export const ANIMATION_APPLY_SCALE = [
  ANIMATION_ID.ZOOM,
  ANIMATION_ID.BREATH,
]

export const ANIMATION_APPLY_DIRECTION = [
  ANIMATION_ID.BASELINE,
  ANIMATION_ID.WIPE,
  ANIMATION_ID.RISE,
]

export const NEON = {
  LOOP: 8,
  VALUE: [
    { opacity: 0 },
    { opacity: 1 },
    { opacity: 0 },
    { opacity: 1 },
    { opacity: 0 },
    { opacity: 1 },
    { opacity: 0 },
    { opacity: 1 },
  ]
};

export const dRise = 200;
export const dPan = 200;

export const TIMELINE_STATUS = {
  IDLE: "idle",
  PLAYING: "playing",
  PAUSED: "paused",
  COMPLETED: "completed",
};

export const getAnimationEnterConfig = (type, defaultProps, properties) => {
  switch (type) {
    case ANIMATION_ID.FADE:
      return {
        from: {
          opacity: 0,
        },
        to: {
          opacity: 1,
          ease: Power3.easeIn,
          duration: properties.duration
        },
      };
    case ANIMATION_ID.RISE:
      return {
        from: {
          ...defaultProps,
          ...{
            [DIRECTION.UP]: { y: defaultProps.y + dRise },
            [DIRECTION.DOWN]: { y: defaultProps.y - dRise },
            [DIRECTION.LEFT]: { x: defaultProps.x + dRise },
            [DIRECTION.RIGHT]: { x: defaultProps.x - dRise },
          }[properties?.direction || DIRECTION.UP],
        },
        to: { ...defaultProps, ease: 'rise', duration: properties.duration },
      }
    case ANIMATION_ID.PAN:
      return {
        from: {
          x: defaultProps.x - dRise
        },
        to: { x: defaultProps.x, ease: 'rise', duration: properties.duration },
      }
    case ANIMATION_ID.BASELINE:
      return {
        from: {
          ...defaultProps,
          ...{
            [DIRECTION.UP]: {
              height: 0,
              offsetY: -defaultProps.height,
              clipY: -defaultProps.clipHeight,
            },
            [DIRECTION.DOWN]: {
              height: 0,
              offsetY: defaultProps.height,
              clipY: defaultProps.clipHeight,
            },
            [DIRECTION.LEFT]: {
              width: 0,
              offsetX: -defaultProps.width,
              clipX: -defaultProps.clipWidth,
            },
            [DIRECTION.RIGHT]: {
              width: 0,
              offsetX: defaultProps.width,
              clipX: defaultProps.clipWidth,
            },
          }[properties?.direction || DIRECTION.UP],
        },
        to: {
          ...defaultProps,
          ...{
            [DIRECTION.UP]: {
              height: defaultProps.height,
              clipY: 0,
              offsetY: 0,
            },
            [DIRECTION.DOWN]: {
              height: defaultProps.height,
              clipY: 0,
              offsetY: 0,
            },
            [DIRECTION.LEFT]: {
              width: defaultProps.width,
              clipX: 0,
              offsetX: 0,
            },
            [DIRECTION.RIGHT]: {
              width: defaultProps.width,
              clipX: 0,
              offsetX: 0,
            },
          }[properties?.direction || DIRECTION.UP],
          duration: properties.duration,
        },
      };
    case ANIMATION_ID.WIPE:
      return {
        from: {
          ...defaultProps,
          ...{
            [DIRECTION.UP]: {
              clipY: defaultProps.clipHeight,
            },
            [DIRECTION.DOWN]: {
              clipHeight: 0,
            },
            [DIRECTION.RIGHT]: {
              clipWidth: 0,
            },
            [DIRECTION.LEFT]: {
              clipX: defaultProps.width,
            },
          }[properties?.direction || DIRECTION.UP],
        },
        to: {
          ...defaultProps,
          ...{
            [DIRECTION.UP]: {
              clipY: 0,
            },
            [DIRECTION.DOWN]: {
              clipHeight: defaultProps.clipHeight,
            },
            [DIRECTION.RIGHT]: {
              clipWidth: defaultProps.clipWidth,
            },
            [DIRECTION.LEFT]: {
              clipX: 0,
            },
          }[properties?.direction || DIRECTION.UP],
          duration: properties.duration,
        },
      };
    case ANIMATION_ID.POP:
      return {
        from: {
          width: 0,
          height: 0,
          scaleX: defaultProps.scaleX * 0.5,
          scaleY: defaultProps.scaleY * 0.5,
          offsetX: -defaultProps.width * 0.25,
          offsetY: -defaultProps.height * 0.25,
        },
        to: {
          width: defaultProps.width,
          height: defaultProps.height,
          scaleX: 1,
          scaleY: 1,
          offsetX: 0,
          offsetY: 0,
          ease: 'elastic.out(1, 0.2)',
          duration: properties.duration,
        },
      };

    case ANIMATION_ID.ZOOM:
      return {
        from: {
          scaleX: 1,
          scaleY: 1,
        },
        to: {
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 5,
          ease: "power3.out",
        },
      };

    case ANIMATION_ID.BREATH:
      return {
        from: {
          ...defaultProps,
          ...{
            [ANIMATION_SCALE.IN]: {
              scaleX: 1.2,
              scaleY: 1.2,
              x: defaultProps.x - defaultProps.width * 0.5 * 0.2,
              y: defaultProps.y - defaultProps.height * 0.5 * 0.2,
            },
            [ANIMATION_SCALE.OUT]: {
              scaleX: 0.8,
              scaleY: 0.8,
              x: defaultProps.x + defaultProps.width * 0.5 * 0.2,
              y: defaultProps.y + defaultProps.height * 0.5 * 0.2,
            },
          }[properties?.scale || ANIMATION_SCALE.IN],
        },
        to: {
          ...defaultProps,
          scaleX: 1,
          scaleY: 1,
          duration: 3,
        },
      };

    case ANIMATION_ID.NEON:
      return {
        from: { opacity: 0 },
        to: {
          opacity: 1,
          repeat: 10,
          ease: "power1.inOut",
          duration: +(properties.duration / 10).toFixed(2),
          yoyo: true,
        }
      };

    default:
      return {
        from: defaultProps,
        to: defaultProps,
      }
  }
};

export const getAnimationExitConfig = (type, defaultProps, properties) => {
  switch (type) {
    case ANIMATION_ID.FADE:
      return {
        from: {
          opacity: 1,
        },
        to: {
          opacity: 0,
          ease: Power3.easeOut,
          duration: properties.duration
        },
      };
    case ANIMATION_ID.RISE:
      return {
        from: defaultProps,
        to: {
          opacity: 0,
          ...{
            [DIRECTION.UP]: { y: defaultProps.y - dRise },
            [DIRECTION.DOWN]: { y: defaultProps.y + dRise },
            [DIRECTION.LEFT]: { x: defaultProps.x - dRise },
            [DIRECTION.RIGHT]: { x: defaultProps.x + dRise },
          }[properties?.direction || DIRECTION.UP],
          ease: 'rise',
          duration: properties.duration
        },
      }
    case ANIMATION_ID.PAN:
      return {
        from: defaultProps,
        to: {
          opacity: 0,
          x: defaultProps.x + dPan,
          ease: 'rise',
          duration: properties.duration
        },
      }
    case ANIMATION_ID.BASELINE:
      return {
        from: {
          ...defaultProps,
          ...{
            [DIRECTION.UP]: {
              clipHeight: defaultProps.clipHeight,
              // height: defaultProps.height,
              clipY: defaultProps.clipY,
              offsetY: 0,
            },
            [DIRECTION.DOWN]: {
              clipHeight: defaultProps.clipHeight,
              height: defaultProps.height,
              offsetY: 0,
            },
            [DIRECTION.LEFT]: {
              clipWidth: defaultProps.clipWidth,
              width: defaultProps.width,
              clipX: defaultProps.clipX,
              offsetX: 0,
            },
            [DIRECTION.RIGHT]: {
              clipWidth: defaultProps.clipWidth,
              width: defaultProps.width,
              offsetX: 0,
            },
          }[properties?.direction || DIRECTION.UP],
        },
        to: {
          opacity: 0,
          ...{
            [DIRECTION.UP]: {
              clipHeight: 0,
              // height: 0,
              clipY: defaultProps.clipHeight + defaultProps.clipY,
              offsetY: defaultProps.height,
            },
            [DIRECTION.DOWN]: {
              clipHeight: 0,
              height: 0,
              offsetY: -defaultProps.height,
            },
            [DIRECTION.LEFT]: {
              clipWidth: 0,
              width: 0,
              clipX: defaultProps.clipWidth + defaultProps.clipX,
              offsetX: defaultProps.width,
            },
            [DIRECTION.RIGHT]: {
              clipWidth: 0,
              width: 0,
              offsetX: -defaultProps.width,
            },
          }[properties?.direction || DIRECTION.UP],
          duration: properties.duration,
        },
      };
    case ANIMATION_ID.WIPE:
      return {
        from: {
          ...defaultProps,
          ...{
            [DIRECTION.DOWN]: {
              clipHeight: defaultProps.clipHeight,
              height: defaultProps.height,
              clipY: defaultProps.clipY,
            },
            [DIRECTION.UP]: {
              clipHeight: defaultProps.clipHeight,
              height: defaultProps.height,
            },
            [DIRECTION.LEFT]: {
              clipWidth: defaultProps.clipWidth,
              width: defaultProps.width,
            },
            [DIRECTION.RIGHT]: {
              clipWidth: defaultProps.clipWidth,
              width: defaultProps.width,
              clipX: defaultProps.clipX,
            },
          }[properties?.direction || DIRECTION.RIGHT],
        },
        to: {
          opacity: 0,
          ...{
            [DIRECTION.DOWN]: {
              clipHeight: 0,
              height: 0,
              clipY: defaultProps.clipHeight + defaultProps.clipY,
            },
            [DIRECTION.UP]: {
              clipHeight: 0,
              height: 0,
            },
            [DIRECTION.LEFT]: {
              clipWidth: 0,
              width: 0,
            },
            [DIRECTION.RIGHT]: {
              clipWidth: 0,
              width: 0,
              clipX: defaultProps.clipWidth + defaultProps.clipX,
            },
          }[properties?.direction || DIRECTION.RIGHT],
          duration: properties.duration,
        },
      };
    case ANIMATION_ID.POP:
      return {
        from: {
          width: defaultProps.width,
          height: defaultProps.height,
          scaleX: 1,
          scaleY: 1,
          offsetX: 0,
          offsetY: 0,
        },
        to: {
          width: 0,
          height: 0,
          scaleX: defaultProps.scaleX * 0.5,
          scaleY: defaultProps.scaleY * 0.5,
          offsetX: -defaultProps.width * 0.25,
          offsetY: -defaultProps.height * 0.25,
          ease: 'elastic.in(1, 0.2)', // Adjust the ease function to match the exit effect
          duration: properties.duration,
        },
      };

    case ANIMATION_ID.ZOOM:
      return {
        from: { opacity: 1 },
        to: {
          opacity: 0,
          duration: 0.2,
          ease: Power3.easeOut,
        },
      };

    case ANIMATION_ID.BREATH:
      return {
        from: { opacity: 1 },
        to: {
          opacity: 0,
          duration: 0.2,
          ease: Power3.easeOut,
        },
      };

    case ANIMATION_ID.NEON:
      return {
        from: { opacity: 1 },
        to: {
          opacity: 0,
          repeat: 10,
          ease: "power1.inOut",
          duration: +(properties.duration / 10).toFixed(2),
          yoyo: true,
        }
      };

    default:
      return {
        from: defaultProps,
        to: defaultProps,
      }
  }
};
