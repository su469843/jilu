// 导入必要的依赖
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// 创建根节点
const root = ReactDOM.createRoot(document.getElementById('root'));

// 渲染应用
root.render(
  // 严格模式
  <React.StrictMode>
    {/* 路由配置 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
); 