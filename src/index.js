// 导入必要的依赖
import React from 'react';
import ReactDOM from 'react-dom/client';
import { 
  BrowserRouter, 
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider 
} from 'react-router-dom';
import './index.css';
import App from './App';

// 创建根节点
const root = ReactDOM.createRoot(document.getElementById('root'));

// 创建路由配置，添加 future flags
const router = createBrowserRouter(
  createRoutesFromElements(
    <App />
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

// 渲染应用
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
); 