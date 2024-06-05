import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import CanvasBoard from "./CanvasBoard.tsx";
import CanvasCapture from "./CanvasCapture.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CanvasCapture />
  </React.StrictMode>,
);
