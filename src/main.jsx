import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./app/globals.css";

// Ensure a #root element is available
const rootElement =
  document.getElementById("root") ||
  (() => {
    const el = document.createElement("div");
    el.id = "root";
    document.body.appendChild(el);
    return el;
  })();

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
