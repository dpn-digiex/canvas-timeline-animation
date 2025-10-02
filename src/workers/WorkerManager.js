// WorkerManager - Interface để giao tiếp với Canvas Animation Worker
// Quản lý việc tạo, điều khiển và nhận dữ liệu từ worker

export class WorkerManager {
  constructor() {
    this.worker = null;
    this.canvas = null;
    this.offscreenCanvas = null;
    this.isInitialized = false;
    this.isInitializing = false;
    this.eventHandlers = new Map();
  }

  // Khởi tạo worker với OffscreenCanvas
  async initialize(canvasElement, config = {}) {
    // Prevent multiple initialization attempts
    if (this.isInitialized || this.isInitializing) {
      throw new Error('WorkerManager is already initialized or initializing');
    }
    this.isInitializing = true;

    try {
      // Cleanup any existing worker first
      if (this.worker) {
        this.terminate();
      }

      // Tạo worker
      this.worker = new Worker(
        new URL('./canvasAnimationWorker.js', import.meta.url),
        { type: 'module' }
      );
      
      this.canvas = canvasElement;
      
      // Tạo OffscreenCanvas từ canvas element
      this.offscreenCanvas = canvasElement.transferControlToOffscreen();
      
      // Thiết lập message handler
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);
      
      // Gửi OffscreenCanvas và config đến worker
      this.worker.postMessage({
        type: 'init',
        data: {
          canvas: this.offscreenCanvas,
          config: {
            width: config.width || 800,
            height: config.height || 500,
            ...config
          }
        }
      }, [this.offscreenCanvas]);
      
      // Đợi worker khởi tạo xong
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.isInitializing = false;
          reject(new Error('Worker initialization timeout'));
        }, 5000);
        
        this.once('worker-initialized', (data) => {
          clearTimeout(timeout);
          this.isInitializing = false;
          if (data.success) {
            this.isInitialized = true;
            resolve(data);
          } else {
            reject(new Error('Worker initialization failed'));
          }
        });

        this.once('worker-error', (data) => {
          clearTimeout(timeout);
          this.isInitializing = false;
          reject(new Error(`Worker error: ${data.error}`));
        });
      });
      
    } catch (error) {
      this.isInitializing = false;
      console.error('Failed to initialize WorkerManager:', error);
      throw error;
    }
  }

  proxyEvent(eventData) {
    if (!this.isReady()) return;
    this.worker.postMessage(eventData);
  }

  // Xử lý message từ worker
  handleWorkerMessage(event) {
    const { type, ...data } = event.data;
    
    // Emit event để các component khác có thể lắng nghe
    this.emit(type, data);
    
    // Log để debug
    console.log(`[Worker] ${type}:`, data);
  }

  // Xử lý lỗi từ worker
  handleWorkerError(error) {
    console.error('Worker error:', error);
    this.emit('worker-error', { error: error.message });
  }

  // Tạo element trong worker
  createElement(elementData) {
    if (!this.isReady()) {
      throw new Error('WorkerManager not ready');
    }
    
    this.worker.postMessage({
      type: 'create-element',
      data: { element: elementData }
    });
  }

  // Apply animation cho element
  applyAnimation(elementId, animationConfig) {
    if (!this.isReady()) {
      throw new Error('WorkerManager not ready');
    }
    
    this.worker.postMessage({
      type: 'apply-animation',
      data: {
        elementId,
        animation: animationConfig
      }
    });
  }

  // Set background color
  setBackground(color) {
    if (!this.isReady()) {
      throw new Error('WorkerManager not ready');
    }
    
    this.worker.postMessage({
      type: 'set-background',
      data: { color }
    });
  }

  // Điều khiển timeline
  controlTimeline(action, params = {}) {
    if (!this.isReady()) {
      throw new Error('WorkerManager not ready');
    }
    
    this.worker.postMessage({
      type: 'control-timeline',
      data: { action, params }
    });
  }

  // Play animation
  play(seekTime) {
    this.controlTimeline('play', { seekTime });
  }

  // Pause animation
  pause() {
    this.controlTimeline('pause');
  }

  // Resume animation
  resume() {
    this.controlTimeline('resume');
  }

  // Reset animation
  reset() {
    this.controlTimeline('reset');
  }

  // Seek to specific progress (0-1)
  seek(progress) {
    this.controlTimeline('seek', { progress });
  }

  // Capture current frame
  captureFrame() {
    if (!this.isReady()) {
      throw new Error('WorkerManager not ready');
    }
    
    this.worker.postMessage({
      type: 'capture-frame',
      data: {}
    });
  }

  // Clear tất cả elements
  clearElements() {
    if (!this.isReady()) {
      throw new Error('WorkerManager not ready');
    }
    
    this.worker.postMessage({
      type: 'clear-elements',
      data: {}
    });
  }

  // Load complete scene từ data (tương tự như PAGES data)
  loadScene(sceneData) {
    if (!this.isReady()) {
      throw new Error('WorkerManager not ready');
    }

    console.log('sceneData', sceneData);
    
    
    const scene = {
      backgroundColor: sceneData.backgroundColor,
      elements: sceneData.children?.map(child => ({
        id: child.id,
        elementType: child.elementType,
        x: child.x,
        y: child.y,
        src: child.src,
        text: child.text,
        width: child.width,
        height: child.height,
        fontSize: child.fontSize,
        fontFamily: child.fontFamily,
        fill: child.textFill,
        ...child
      })),
      animations: sceneData.animationsApply?.map(animation => ({
        elementId: animation.id,
        ...animation
      }))
    };
    
    this.worker.postMessage({
      type: 'load-scene',
      data: { scene }
    });
  }

  // Event system
  on(eventName, handler) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    this.eventHandlers.get(eventName).push(handler);
  }

  once(eventName, handler) {
    const onceHandler = (data) => {
      handler(data);
      this.off(eventName, onceHandler);
    };
    this.on(eventName, onceHandler);
  }

  off(eventName, handler) {
    if (this.eventHandlers.has(eventName)) {
      const handlers = this.eventHandlers.get(eventName);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(eventName, data) {
    if (this.eventHandlers.has(eventName)) {
      this.eventHandlers.get(eventName).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      });
    }
  }

  // Terminate worker
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    // Reset all states
    this.canvas = null;
    this.offscreenCanvas = null;
    this.isInitialized = false;
    this.isInitializing = false;
    this.eventHandlers.clear();
  }

  // Check if worker is ready for operations
  isReady() {
    return this.isInitialized && !this.isInitializing && this.worker;
  }

  // Utility method để tạo scene từ PAGES data format
  static createSceneFromPage(page) {
    return {
      backgroundColor: page.backgroundColor,
      children: page.children,
      animationsApply: page.animationsApply
    };
  }
}
