import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { BrowserRouter as Router } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext";
const root = ReactDOM.createRoot(document.getElementById("root"));

const config = {};

const response = await fetch("config.json");
const data = await response.json();
Object.assign(config, data);

root.render(
  <Router basename={config?.basename}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);

reportWebVitals();
