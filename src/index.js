// 导入必要的依赖
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// 创建根节点
const root = ReactDOM.createRoot(document.getElementById('root'));

// 使用 BrowserRouter 包装应用
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
); 