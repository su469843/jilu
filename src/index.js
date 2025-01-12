// 导入必要的依赖
import React from 'react';
import ReactDOM from 'react-dom/client';
import { 
  createBrowserRouter,
  RouterProvider 
} from 'react-router-dom';
import './index.css';
import App from './App';
import NotFound from './components/NotFound';
import ErrorPage from './components/ErrorPage';
import Intro from './components/Intro';
import Confirm from './components/Confirm';
import MainForm from './components/MainForm';

// 创建路由配置，添加 future flags
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainForm />,
    errorElement: <ErrorPage />
  },
  {
    path: "/jieshao",
    element: <Intro />
  },
  {
    path: "/queren",
    element: <Confirm />
  },
  {
    path: "/error",
    element: <ErrorPage />
  },
  {
    path: "*",
    element: <NotFound />
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

// 创建根节点
const root = ReactDOM.createRoot(document.getElementById('root'));

// 渲染应用
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
); 