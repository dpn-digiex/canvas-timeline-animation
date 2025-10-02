import React, { useRef, useEffect, useState } from 'react';
import { WorkerManager } from './workers/WorkerManager';
import { PAGES } from './animation/data';

// Demo data tương tự như PAGES data từ sample
const DEMO_SCENE_DATA = PAGES[0];

const CanvasWorkerDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerManagerRef = useRef<WorkerManager | null>(null);
  const canvasKeyRef = useRef(0); // Key để force re-create canvas

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timelineStatus, setTimelineStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Helper function để add log
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 20)]);
  };

  // Cleanup worker
  const cleanupWorker = () => {
    if (workerManagerRef.current) {
      addLog('Đang cleanup worker...');
      workerManagerRef.current.terminate();
      workerManagerRef.current = null;
    }
    setIsInitialized(false);
    setTimelineStatus('idle');
    setProgress(0);
    setCurrentTime(0);
    setTotalDuration(0);
  };

  // Tạo canvas element mới
  const recreateCanvas = () => {
    canvasKeyRef.current += 1;
    // Force re-render canvas element
    setTimeout(() => {
      if (canvasRef.current) {
        addLog('Canvas element đã được tạo lại');
      }
    }, 100);
  };

  // Khởi tạo worker
  const initializeWorker = async () => {
    if (!canvasRef.current) {
      addLog('Canvas element không tồn tại');
      return;
    }

    if (isLoading) {
      addLog('Đang trong quá trình khởi tạo...');
      return;
    }

    // Cleanup existing worker if any
    if (workerManagerRef.current) {
      cleanupWorker();
      recreateCanvas();
      // Wait for canvas to be recreated
      setTimeout(async () => {
        await performInitialization();
      }, 150);
      return;
    }

    await performInitialization();
  };

  const performInitialization = async () => {
    if (!canvasRef.current) {
      addLog('Lỗi: Canvas element không tồn tại sau khi recreate');
      return;
    }

    setIsLoading(true);
    addLog('Đang khởi tạo Canvas Worker...');

    try {
      const workerManager = new WorkerManager();

      // Setup event listeners
      workerManager.on('worker-ready', () => {
        addLog('Worker sẵn sàng');
      });

      workerManager.on('worker-initialized', (data) => {
        addLog('Worker đã khởi tạo thành công');
        setIsInitialized(true);
        setIsLoading(false);
      });

      workerManager.on('timeline-update', (data) => {
        setProgress(data.progress);
        setCurrentTime(data.time);
        setTotalDuration(data.totalDuration);
      });

      workerManager.on('timeline-status', (data) => {
        setTimelineStatus(data.status);
        addLog(`Timeline status: ${data.status}`);
      });

      workerManager.on('timeline-complete', () => {
        setTimelineStatus('completed');
        addLog('Animation hoàn thành');
      });

      workerManager.on('frame-captured', (data) => {
        addLog(`Frame captured at ${data.timestamp.toFixed(2)}s`);
        // Có thể download frame ở đây nếu cần
      });

      workerManager.on('worker-error', (data) => {
        addLog(`Lỗi Worker: ${data.error}`);
        console.error('Worker error:', data.error);
      });

      // Khởi tạo với canvas
      await workerManager.initialize(canvasRef.current, {
        width: 800,
        height: 500,
      });

      workerManagerRef.current = workerManager;
    } catch (error) {
      addLog(`Lỗi khởi tạo: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Load scene data
  const loadScene = () => {
    if (!workerManagerRef.current) return;

    addLog('Đang load scene data...');
    workerManagerRef.current.loadScene(DEMO_SCENE_DATA);
    addLog(
      `Đã load ${DEMO_SCENE_DATA.children.length} elements và ${DEMO_SCENE_DATA.animationsApply.length} animations`,
    );
  };

  // Control functions
  const play = () => {
    if (!workerManagerRef.current) return;
    workerManagerRef.current.play();
    addLog('Bắt đầu phát animation');
  };

  const pause = () => {
    if (!workerManagerRef.current) return;
    workerManagerRef.current.pause();
    addLog('Tạm dừng animation');
  };

  const resume = () => {
    if (!workerManagerRef.current) return;
    workerManagerRef.current.resume();
    addLog('Tiếp tục animation');
  };

  const reset = () => {
    if (!workerManagerRef.current) return;
    workerManagerRef.current.reset();
    addLog('Reset animation');
  };

  const captureFrame = () => {
    if (!workerManagerRef.current) return;
    workerManagerRef.current.captureFrame();
    addLog('Đang chụp frame...');
  };

  const clearElements = () => {
    if (!workerManagerRef.current) return;
    workerManagerRef.current.clearElements();
    addLog('Đã xóa tất cả elements');
  };

  // Handle progress change
  const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(event.target.value) / 100;
    if (workerManagerRef.current) {
      workerManagerRef.current.seek(newProgress);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      cleanupWorker();
    };
  }, []);

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      {/* Canvas area */}
      <div style={{ flex: 1 }}>
        <h2>Canvas Worker Demo</h2>
        <div style={{ border: '2px solid #ccc', display: 'inline-block' }}>
          <canvas key={canvasKeyRef.current} ref={canvasRef} width={800} height={500} style={{ display: 'block' }} />
        </div>

        {/* Timeline controls */}
        {isInitialized && (
          <div style={{ marginTop: '20px', width: '800px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span>
                Status: <strong>{timelineStatus}</strong>
              </span>
              <span>
                Time: {currentTime.toFixed(2)}s / {totalDuration.toFixed(2)}s
              </span>
              <span>Progress: {(progress * 100).toFixed(1)}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress * 100}
              onChange={handleProgressChange}
              style={{ width: '100%' }}
            />
          </div>
        )}
      </div>

      {/* Controls panel */}
      <div style={{ width: '300px', padding: '20px' }}>
        <h3>Controls</h3>

        {!isInitialized ? (
          <div>
            <button
              onClick={initializeWorker}
              disabled={isLoading}
              style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
            >
              {isLoading ? 'Đang khởi tạo...' : 'Khởi tạo Worker'}
            </button>
            {workerManagerRef.current && (
              <button
                onClick={cleanupWorker}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '10px',
                  color: 'white',
                  border: 'none',
                }}
              >
                Reset Worker
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={loadScene} style={{ padding: '10px' }}>
              Load Scene
            </button>

            <hr />

            <button onClick={play} style={{ padding: '10px' }}>
              Play Animation
            </button>
            <button onClick={pause} style={{ padding: '10px' }}>
              Pause
            </button>
            <button onClick={resume} style={{ padding: '10px' }}>
              Resume
            </button>
            <button onClick={reset} style={{ padding: '10px' }}>
              Reset
            </button>

            <hr />

            <button onClick={captureFrame} style={{ padding: '10px' }}>
              Capture Frame
            </button>
            <button onClick={clearElements} style={{ padding: '10px' }}>
              Clear Elements
            </button>
          </div>
        )}

        {/* Logs */}
        <div style={{ marginTop: '20px' }}>
          <h4>Logs</h4>
          <div
            style={{
              height: '200px',
              overflow: 'auto',
              backgroundColor: '#efefef',
              color: '#0f0',
              padding: '10px',
              fontSize: '12px',
              fontFamily: 'monospace',
            }}
          >
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>

        {/* Scene info */}
        <div style={{ marginTop: '20px' }}>
          <h4>System Info</h4>
          <div style={{ fontSize: '14px' }}>
            <div>Canvas Key: {canvasKeyRef.current}</div>
            <div>Worker Status: {isInitialized ? '✅ Ready' : '❌ Not Ready'}</div>
            {isLoading && <div>⏳ Loading...</div>}
          </div>
        </div>

        {/* Scene info */}
        {isInitialized && (
          <div style={{ marginTop: '20px' }}>
            <h4>Scene Info</h4>
            <div style={{ fontSize: '14px' }}>
              <div>Elements: {DEMO_SCENE_DATA.children.length}</div>
              <div>Animations: {DEMO_SCENE_DATA.animationsApply.length}</div>
              <div>Background: {DEMO_SCENE_DATA.backgroundColor}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasWorkerDemo;
