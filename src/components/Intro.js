import React from 'react';
import { useNavigate } from 'react-router-dom';

function Intro() {
  const navigate = useNavigate();
  
  return (
    <div className="intro">
      <h1>班级梦想采访介绍</h1>
      <div className="intro-content">
        <p>欢迎参与五年四班的梦想采访活动！</p>
        <p>在这里，你可以：</p>
        <ul>
          <li>分享你的兴趣爱好</li>
          <li>讲述你的梦想</li>
          <li>记录你的想法</li>
        </ul>
      </div>
      <button onClick={() => navigate('/')}>返回填写</button>
    </div>
  );
}

export default Intro; 