import React from 'react';
import { useNavigate } from 'react-router-dom';

function ErrorPage() {
  const navigate = useNavigate();
  
  return (
    <div className="error-page">
      <h1>出错了</h1>
      <p>抱歉，发生了一些错误。</p>
      <button onClick={() => navigate('/')}>返回首页</button>
    </div>
  );
}

export default ErrorPage; 