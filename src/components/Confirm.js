import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Confirm() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData;

  if (!formData) {
    navigate('/');
    return null;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>确认提交</h1>
      </header>
      <main className="confirmation-content">
        <h2>请确认以下信息：</h2>
        <div className="confirmation-details">
          <p><strong>姓名：</strong>{formData.name}</p>
          <p><strong>号数：</strong>{formData.number}</p>
          <p><strong>手机号：</strong>{formData.phone || '未填写'}</p>
          <p><strong>兴趣爱好：</strong>{formData.interests}</p>
          <p><strong>梦想：</strong>{formData.dreams}</p>
          <p><strong>备注：</strong>{formData.content || '无'}</p>
        </div>
        <div className="confirmation-buttons">
          <button onClick={() => handleSubmit(formData)}>确认提交</button>
          <button 
            className="cancel-button" 
            onClick={() => navigate('/')}
          >
            返回修改
          </button>
        </div>
      </main>
    </div>
  );
}

export default Confirm; 