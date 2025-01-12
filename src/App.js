import React from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <Outlet />
      <noscript>
        <div className="noscript-warning">
          您需要启用 JavaScript 来运行此应用。
        </div>
      </noscript>
    </div>
  );
}

export default App; 