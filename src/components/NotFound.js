import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="not-found">
      <h1>404 - 页面不存在</h1>
      <button onClick={() => navigate('/')}>返回首页</button>
    </div>
  );
}

export default NotFound; 