import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Confirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state?.formData || {};
  
  const handleConfirm = async () => {
    try {
      const response = await fetch('/api/save-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('提交成功！');
        navigate('/');
      } else {
        throw new Error('提交失败');
      }
    } catch (error) {
      console.error('Error:', error);
      navigate('/error');
    }
  };

  return (
    <div className="confirm">
      <h1>确认信息</h1>
      <div className="confirm-content">
        <p><strong>姓名：</strong>{formData.name}</p>
        <p><strong>号数：</strong>{formData.number}</p>
        <p><strong>兴趣爱好：</strong>{formData.interests}</p>
        <p><strong>梦想：</strong>{formData.dreams}</p>
        {formData.phone && <p><strong>手机号：</strong>{formData.phone}</p>}
        {formData.content && <p><strong>备注：</strong>{formData.content}</p>}
      </div>
      <div className="confirm-buttons">
        <button onClick={handleConfirm}>确认提交</button>
        <button onClick={() => navigate('/')}>返回修改</button>
      </div>
    </div>
  );
}

export default Confirm; 