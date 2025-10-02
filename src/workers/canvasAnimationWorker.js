// Canvas Animation Worker using OffscreenCanvas with Konva and GSAP
// This worker simulates the rendering and animation process from the main samples
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { CustomBounce } from 'gsap/CustomBounce';
import Konva from 'konva';

// Register GSAP plugins
gsap.registerPlugin(CustomEase, CustomBounce);

// Create custom eases to match the main thread
CustomEase.create('rise', '0.7004830917874396, 0, 0.4669565217391304, 0.9855072463768115');
CustomEase.create('burst', '.17,.67,.48,1.75');
CustomEase.create('ascend', 'M0,0 C0.11,0.494 0.034,0.792 0.16,0.918 0.292,1.05 0.504,1 1,1 ');

// Animation configurations - copied from main thread
const DIRECTION = {
  UP: 'direction_up',
  DOWN: 'direction_down',
  LEFT: 'direction_left',
  RIGHT: 'direction_right',
};

const ANIMATION_ID = {
  NONE: 'none',
  FADE: 'fade',
  WIPE: 'wipe',
  BASELINE: 'baseline',
  RISE: 'rise',
  PAN: 'pan',
  POP: 'pop',
  ZOOM: 'zoom',
  NEON: 'neon',
  BREATH: 'breath',
  TYPEWRITER: 'typewriter',
  RANDOM_TYPEWRITER: 'random_typewriter',
  ASCEND: 'ascend',
  REVEAL: 'reveal',
  BURST: 'burst',
  SKATE: 'skate',
};

const ANIMATION_SCALE = {
  IN: 'scale_in',
  OUT: 'scale_out',
};

const TIMELINE_STATUS = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  COMPLETED: 'completed',
};

// Worker state
let stage = null;
let layer = null;
let timeline = null;
let canvasWidth = 800;
let canvasHeight = 500;
let elements = new Map();
let mainCanvasContext = null;
let isInitialized = false;

// Animation configuration functions (simplified versions from main thread)
const dRise = 200;
const dPan = 200;

Konva.Util.createCanvasElement = () => {
  const canvas = new OffscreenCanvas(1, 1);
  canvas.style = {}; // Konva cần thuộc tính này
  return canvas;
};
stage = new Konva.Stage({
  width: 800, // Kích thước mặc định
  height: 500,
});
layer = new Konva.Layer();
stage.add(layer);

const getAnimationEnterConfig = (type, defaultProps, properties) => {
  switch (type) {
    case ANIMATION_ID.FADE:
      return {
        from: { opacity: 0 },
        to: { opacity: 1, duration: properties.duration },
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
      };
    case ANIMATION_ID.POP:
      return {
        from: {
          scaleX: 0.5,
          scaleY: 0.5,
          opacity: 0,
        },
        to: {
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          ease: 'elastic.out(1, 0.2)',
          duration: properties.duration,
        },
      };
    case ANIMATION_ID.ZOOM:
      return {
        from: { scaleX: 1, scaleY: 1 },
        to: { scaleX: 1.2, scaleY: 1.2, duration: properties.duration },
      };
    case ANIMATION_ID.BASELINE:
      return {
        from: {
          ...defaultProps,
          ...{
            [DIRECTION.UP]: { height: 0, offsetY: -defaultProps.height },
            [DIRECTION.DOWN]: { height: 0, offsetY: defaultProps.height },
            [DIRECTION.LEFT]: { width: 0, offsetX: -defaultProps.width },
            [DIRECTION.RIGHT]: { width: 0, offsetX: defaultProps.width },
          }[properties?.direction || DIRECTION.UP],
        },
        to: {
          ...defaultProps,
          ...{
            [DIRECTION.UP]: { height: defaultProps.height, offsetY: 0 },
            [DIRECTION.DOWN]: { height: defaultProps.height, offsetY: 0 },
            [DIRECTION.LEFT]: { width: defaultProps.width, offsetX: 0 },
            [DIRECTION.RIGHT]: { width: defaultProps.width, offsetX: 0 },
          }[properties?.direction || DIRECTION.UP],
          duration: properties.duration,
        },
      };
    default:
      return {
        from: defaultProps,
        to: defaultProps,
      };
  }
};

// Initialize the worker with OffscreenCanvas
const initializeWorker = (canvas, config) => {
  try {
    mainCanvasContext = canvas.getContext('2d');
    stage.setSize({
      width: config.width,
      height: config.height
    });

    layer.on('draw', () => {
      mainCanvasContext.clearRect(0, 0, canvas.width, canvas.height);
      mainCanvasContext.drawImage(layer.getCanvas()._canvas, 0, 0);
    });
    
    // Initialize GSAP timeline
    timeline = gsap.timeline({
      paused: true,
      onUpdate: () => {
        // Send progress updates to main thread
        postMessage({
          type: 'timeline-update',
          progress: timeline.progress(),
          time: timeline.time(),
          totalDuration: timeline.totalDuration(),
        });
        
        // Redraw the stage
        layer.batchDraw();
      },
      onComplete: () => {
        postMessage({
          type: 'timeline-complete',
          status: TIMELINE_STATUS.COMPLETED,
        });
      }
    });
    
    isInitialized = true;
    
    postMessage({
      type: 'worker-initialized',
      success: true,
    });
    
  } catch (error) {
    postMessage({
      type: 'worker-error',
      error: error.message,
    });
  }
};

// Create and add elements to the stage
const createElement = async (elementData) => {
  let element = null;

  console.log('elementData', elementData);
  
  switch (elementData.elementType) {
    case 'image':
      element = new Konva.Image({
        id: elementData.id,
        x: elementData.x,
        y: elementData.y,
        width: elementData.width || 100,
        height: elementData.height || 100,
        opacity: 1,
      });
      
      // Load image
      // if (elementData.src) {
      //   const imageObj = new Image();
      //   imageObj.crossOrigin = 'anonymous';
      //   imageObj.onload = () => {
      //     element.image(imageObj);
      //     element.width(elementData.width || imageObj.width);
      //     element.height(elementData.height || imageObj.height);
      //     layer.batchDraw();
      //   };
      //   imageObj.src = elementData.src;
      // }
      if (elementData.src) {
        await fetch(elementData.src)
          .then(response => response.blob())
          .then(blob => createImageBitmap(blob))
          .then(imageBitmap => {
            element.image(imageBitmap);
            element.width(elementData.width || imageBitmap.width);
            element.height(elementData.height || imageBitmap.height);
            if (layer) {
              layer.batchDraw();
            }
          })
          .catch(error => {
            console.error(`Failed to load image: ${elementData.src}`, error);
            postMessage({
                type: 'worker-error',
                error: `Failed to load image: ${elementData.src}`
            });
          });
      }
      break;
      
    case 'text':
      element = new Konva.Text({
        id: elementData.id,
        x: elementData.x,
        y: elementData.y,
        text: elementData.text || 'Sample Text',
        fontSize: elementData.fontSize || 24,
        fontFamily: elementData.fontFamily || 'Arial',
        fill: elementData.fill || '#000000',
        width: elementData.width || 200,
        height: elementData.height || 50,
        opacity: 1,
      });
      break;
      
    case 'video':
      // For video, create a placeholder rect (simplified)
      element = new Konva.Rect({
        id: elementData.id,
        x: elementData.x,
        y: elementData.y,
        width: elementData.width || canvasWidth,
        height: elementData.height || canvasHeight,
        fill: '#000000',
        opacity: 1,
      });
      break;
      
    default:
      element = new Konva.Rect({
        id: elementData.id,
        x: elementData.x,
        y: elementData.y,
        width: elementData.width || 50,
        height: elementData.height || 50,
        fill: '#cccccc',
        opacity: 1,
      });
  }
  
  if (element) {
    elements.set(elementData.id, element);
    layer.add(element);
    layer.batchDraw();
  }
  
  return element;
};

// Apply animation to element
const applyAnimation = (elementId, animationConfig) => {
  const element = elements.get(elementId);
  if (!element || !timeline) return;
  
  const properties = {
    direction: animationConfig.direction,
    scale: animationConfig.scale,
    duration: animationConfig.speed || 1,
  };
  
  const defaultProps = {
    x: element.x(),
    y: element.y(),
    width: element.width(),
    height: element.height(),
    scaleX: element.scaleX(),
    scaleY: element.scaleY(),
    opacity: element.opacity(),
  };
  
  const config = getAnimationEnterConfig(animationConfig.animationId, defaultProps, properties);
  
  // Set initial state
  element.setAttrs(config.from);
  
  // Create tween
  const tween = gsap.fromTo(
    element.getAttrs(),
    config.from,
    {
      ...config.to,
      onUpdate: () => {
        element.setAttrs(element.getAttrs());
      },
    }
  );
  
  // Add to timeline with delay
  timeline.add(tween, animationConfig.delay || 0);
};

// Set background color
const setBackground = (color) => {
  // Remove existing background
  const existingBg = stage.findOne('#background');
  if (existingBg) {
    existingBg.destroy();
  }
  
  // Add new background
  const background = new Konva.Rect({
    id: 'background',
    x: 0,
    y: 0,
    width: canvasWidth,
    height: canvasHeight,
    fill: color || '#ffffff',
  });
  
  layer.add(background);
  background.moveToBottom();
  layer.batchDraw();
};

// Control timeline
const controlTimeline = (action, params = {}) => {
  if (!timeline) return;

  console.log('controlTimeline', action, params);
  console.log("timeline", timeline);
  console.log("timeline.progress()", timeline.progress());
  console.log("timeline.time()", timeline.time());
  console.log("timeline.totalDuration()", timeline.totalDuration());
  
  switch (action) {
    case 'play':
      if (params.seekTime !== undefined) {
        timeline.seek(params.seekTime).play();
      } else {
        timeline.restart().play();
      }
      postMessage({
        type: 'timeline-status',
        status: TIMELINE_STATUS.PLAYING,
      });
      break;
      
    case 'pause':
      timeline.pause();
      postMessage({
        type: 'timeline-status',
        status: TIMELINE_STATUS.PAUSED,
      });
      break;
      
    case 'resume':
      timeline.resume();
      postMessage({
        type: 'timeline-status',
        status: TIMELINE_STATUS.PLAYING,
      });
      break;
      
    case 'reset':
      timeline.restart().pause();
      postMessage({
        type: 'timeline-status',
        status: TIMELINE_STATUS.IDLE,
      });
      break;
      
    case 'seek':
      if (params.progress !== undefined) {
        timeline.progress(params.progress);
        layer.batchDraw();
      }
      break;
      
    case 'clear':
      timeline.clear();
      break;
  }
};

// Capture current frame
const captureFrame = () => {
  if (!stage) return null;
  
  try {
    const dataURL = stage.toDataURL({ mimeType: 'image/png' });
    postMessage({
      type: 'frame-captured',
      dataURL: dataURL,
      timestamp: timeline ? timeline.time() : 0,
    });
  } catch (error) {
    postMessage({
      type: 'worker-error',
      error: `Frame capture failed: ${error.message}`,
    });
  }
};

// Clear all elements
const clearElements = () => {
  elements.clear();
  if (layer) {
    layer.destroyChildren();
    layer.batchDraw();
  }
  if (timeline) {
    timeline.clear();
  }
};

// Message handler
self.onmessage = (event) => {
  const { type, data } = event.data;
  
  try {
    switch (type) {
      case 'init':
        initializeWorker(data.canvas, data.config);
        break;
        
      case 'create-element':
        createElement(data.element);
        break;
        
      case 'apply-animation':
        applyAnimation(data.elementId, data.animation);
        break;
        
      case 'set-background':
        setBackground(data.color);
        break;
        
      case 'control-timeline':
        controlTimeline(data.action, data.params);
        break;
        
      case 'capture-frame':
        captureFrame();
        break;
        
      case 'clear-elements':
        clearElements();
        break;
        
      case 'load-scene':
        // Load complete scene data
        if (data.scene) {
          clearElements();
          if (data.scene.backgroundColor) {
            setBackground(data.scene.backgroundColor);
          }
          
          // Create elements
          data.scene.elements?.forEach(element => {
            createElement(element);
          });
          
          // Apply animations
          data.scene.animations?.forEach(animation => {
            applyAnimation(animation.elementId, animation);
          });
        }
        break;
        
      default:
        postMessage({
          type: 'worker-error',
          error: `Unknown message type: ${type}`,
        });
    }
  } catch (error) {
    postMessage({
      type: 'worker-error',
      error: error.message,
    });
  }
};

// Error handler
self.onerror = (error) => {
  postMessage({
    type: 'worker-error',
    error: error.message,
  });
};

postMessage({
  type: 'worker-ready',
  message: 'Canvas Animation Worker is ready',
});
