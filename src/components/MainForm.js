import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MainForm.css';

function MainForm() {
  const navigate = useNavigate();
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    phone: '',
    interests: '',
    dreams: '',
    content: ''
  });

  // 定义 Turnstile 回调函数
  useEffect(() => {
    // 定义全局回调函数
    window.handleTurnstileCallback = (token) => {
      console.log("验证成功，获取到 token");
      setTurnstileToken(token);
    };

    window.handleTurnstileError = (error) => {
      console.error("验证出错:", error);
      setTurnstileToken(null);
    };

    window.handleTurnstileExpired = () => {
      console.log("验证已过期");
      setTurnstileToken(null);
    };

    // 清理函数
    return () => {
      delete window.handleTurnstileCallback;
      delete window.handleTurnstileError;
      delete window.handleTurnstileExpired;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!turnstileToken) {
      alert('请先完成人机验证');
      return;
    }

    try {
      // 1. 验证 Turnstile token
      const verifyResponse = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: turnstileToken })
      });

      const verifyResult = await verifyResponse.json();
      if (!verifyResult.success) {
        alert('人机验证失败，请重试');
        if (window.turnstile) {
          window.turnstile.reset();
        }
        return;
      }

      // 2. 检查 IP 提交次数
      const ipCheckResponse = await fetch('/api/check-ip');
      const ipCheckResult = await ipCheckResponse.json();
      
      if (!ipCheckResult.allowed) {
        alert(`您已达到最大提交次数 (${ipCheckResult.submissions}/2)`);
        return;
      }

      // 3. 保存记录
      const saveResponse = await fetch('/api/save-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData })
      });

      const saveResult = await saveResponse.json();
      if (!saveResult.success) {
        throw new Error(saveResult.error || '保存失败');
      }

      // 4. 跳转到确认页面
      navigate('/queren', { state: { formData } });

    } catch (error) {
      console.error('提交错误:', error);
      alert('提交失败，请重试');
      if (window.turnstile) {
        window.turnstile.reset();
      }
    }
  };

  const handleShowIntro = () => {
    navigate('/jieshao');
  };

  return (
    <div className="form-container">
      <header className="App-header">
        <h1>记录提交</h1>
        <div className="class-info">五年四班</div>
      </header>
      
      <main>
        <div className="verification-notice">
          <span role="img" aria-label="warning">⚠️</span> 请先完成人机验证
        </div>

        {/* Turnstile 容器 */}
        <div className="turnstile-wrapper">
          <div 
            className="cf-turnstile"
            data-sitekey="0x4AAAAAAA2BDJ8F9WxaTiZn"
            data-callback="handleTurnstileCallback"
            data-error-callback="handleTurnstileError"
            data-expired-callback="handleTurnstileExpired"
            data-theme="auto"
            data-language="zh-CN"
            data-size="normal"
            data-appearance="always"
            data-retry="auto"
            data-retry-interval="2000"
            data-refresh-expired="auto"
          ></div>
        </div>

        <form onSubmit={handleSubmit} className="dream-form">
          <div className="form-group">
            <label htmlFor="name">姓名</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="number">号数</label>
            <input
              type="number"
              id="number"
              name="number"
              value={formData.number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">手机号（选填）</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="interests">兴趣爱好...</label>
            <textarea
              id="interests"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dreams">梦想...</label>
            <textarea
              id="dreams"
              name="dreams"
              value={formData.dreams}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">其他备注（选填）...</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
            />
          </div>

          <div className="form-buttons">
            <button 
              type="submit" 
              className={`submit-button ${!turnstileToken ? 'disabled' : ''}`}
              disabled={!turnstileToken}
            >
              {!turnstileToken ? '请先完成验证' : '提交记录'}
            </button>
          </div>

          <div className="privacy-notice">
            别担心，我们全程保密！
            <button 
              type="button" 
              onClick={handleShowIntro} 
              className="intro-link"
            >
              点此查看
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default MainForm; 