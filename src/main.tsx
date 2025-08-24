import React from 'react';
import ReactDOM from 'react-dom/client';

import CanvasBoard from './poc/CanvasBoard.tsx';
import CanvasCapture from './poc/CanvasCapture.tsx';
import CanvasFramerMotion from './poc/CanvasFramerMotion.tsx';
import CanvasAnimeJS from './poc/CanvasAnimeJS.tsx';
import CanvasGsapTimeline from './poc/CanvasGsapTimeline.tsx';

import './index.css';
import CanvasGsapAnimation from './CanvasGsapAnimation';
import { GSAPProvider } from './GsapProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GSAPProvider>
      <CanvasGsapAnimation />
    </GSAPProvider>
    ,
  </React.StrictMode>,
);
