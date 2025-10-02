import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import CanvasGsapAnimation from './CanvasGsapAnimation';
import CanvasWorkerDemo from './CanvasWorkerDemo.tsx';
import { GSAPProvider } from './GsapProvider';

// App demo selector
const AppDemo = () => {
  const [activeDemo, setActiveDemo] = React.useState<'original' | 'worker'>('original');

  return (
    <div>
      <div
        style={{
          padding: '20px',
          backgroundColor: '#f0f0f0',
          borderBottom: '1px solid #ccc',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <h1 style={{ margin: 0, marginRight: '20px' }}>Animation Demos</h1>
        <button
          onClick={() => setActiveDemo('original')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeDemo === 'original' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Original (Main Thread)
        </button>
        <button
          onClick={() => setActiveDemo('worker')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeDemo === 'worker' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Worker Demo (OffscreenCanvas)
        </button>
      </div>

      {activeDemo === 'original' ? (
        <GSAPProvider>
          <CanvasGsapAnimation />
        </GSAPProvider>
      ) : (
        <CanvasWorkerDemo />
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppDemo />
  </React.StrictMode>,
);
