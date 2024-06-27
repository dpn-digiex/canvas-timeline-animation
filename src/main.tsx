import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import CanvasBoard from './CanvasBoard.tsx';
import CanvasCapture from './CanvasCapture.tsx';
import CanvasFramerMotion from './CanvasFramerMotion.tsx';
import CanvasAnimeJS from './CanvasAnimeJS.tsx';

import CanvasGsapTimeline from './CanvasGsapTimeline.tsx';

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
