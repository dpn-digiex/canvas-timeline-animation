import { ANIMATION_ANIMATE, ANIMATION_ID, TYPE_WRITING } from "./config";

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;
export const CONTROLS_WIDTH = 250;
export const TOTAL_TIME_TEMPLATE = 6;
export const FPS = 30;
export const INTERVAL_DURATION_MS = 1 / FPS;
export const IMAGE_TYPE = 'png';
export const PAGES = [
  {
    pageIndex: 0,
    pageId: 'page_01',
    pageDuration: 5,
    animationsApply: [
      // {
      //   id: 'page_01_id_01',
      //   elementType: 'video',
      //   animationId: 'fade',
      //   speed: 1,
      //   scale: null,
      // },
      {
        id: 'page_01_id_02',
        elementType: 'image',
        animationId: 'pop',
        speed: 1,
        direction: null,
        scale: 'scale_in',
      },
      {
        id: 'page_01_id_03',
        elementType: 'image',
        animationId: 'zoom',
        speed: 1,
        direction: null,
        scale: 'scale_in',
      },
      {
        id: 'page_01_id_05',
        elementType: 'image',
        animationId: 'baseline',
        speed: 1,
        direction: 'direction_up',
        scale: null,
      },
      {
        id: 'page_01_id_04',
        elementType: 'image',
        animationId: 'rise',
        speed: 1,
        direction: 'direction_up',
        scale: null,
      },
    ],
    backgroundColor: '#ef8920',
    children: [
      {
        id: 'page_01_id_01',
        x: 0,
        y: 0,
        elementType: 'video',
        src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Video/adc807d379b1431ebf2c0eea75cd548c.mp4',
      },
      {
        id: 'page_01_id_02',
        x: 50,
        y: 100,
        elementType: 'image',
        src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Image/af123eac3ff3469a96cd1bf688e4f3f5.jpg',
      },
      {
        id: 'page_01_id_03',
        x: 400,
        y: 100,
        elementType: 'image',
        src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Image/96221dedae1846f3ac58226133062bdf.jpg',
      },
      {
        id: 'page_01_id_04',
        x: 300,
        y: 400,
        elementType: 'image',
        src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Image/af123eac3ff3469a96cd1bf688e4f3f5.jpg',
      },
      {
        id: 'page_01_id_05',
        x: 600,
        y: 400,
        elementType: 'image',
        src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Image/96221dedae1846f3ac58226133062bdf.jpg',
      },
    ],
  },
  {
    pageIndex: 1,
    pageId: 'page_02',
    pageDuration: 3,
    animationsApply: [],
    backgroundColor: '#f0f0f0',
    children: [
      // {
      //   id: 'page_02_id_01',
      //   x: 600,
      //   y: 100,
      //   elementType: 'image',
      //   src: 'https://stg-brandelement-static.obello.com/66160212455f272d73304bda/Image/af123eac3ff3469a96cd1bf688e4f3f5.jpg',
      // },
      {
        id: 'page_02_id_02',
        x: 200,
        y: 300,
        elementType: 'text',
      },
    ],
  },
];

export const elementAnimation = {
  id: '',
  elementType: '',
  animationId: ANIMATION_ID.NONE,
  speed: 0,
  delay: 0,
  timing: { enter: null, exit: null },
  // optional
  direction: null,
  scale: null,
  animate: ANIMATION_ANIMATE.ENTER,
  typeWriting: TYPE_WRITING.ELEMENT,
};