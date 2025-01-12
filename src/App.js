import React, { useState, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import NotFound from './components/NotFound';
import ErrorPage from './components/ErrorPage';
import Intro from './components/Intro';
import Confirm from './components/Confirm';

// 主应用组件
function App() {
  return (
    <Routes>
      <Route path="/" element={<MainForm />} />
      <Route path="/jieshao" element={<Intro />} />
      <Route path="/queren" element={<Confirm />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// 主表单组件
function MainForm() {
  const navigate = useNavigate();
  const turnstileRef = useRef();
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    phone: '',
    interests: '',
    dreams: '',
    content: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 获取 Turnstile token
    const token = turnstileRef.current.getResponse();
    if (!token) {
      alert('请完成人机验证');
      return;
    }

    // 验证 token
    try {
      const response = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      const result = await response.json();
      if (!result.success) {
        alert('人机验证失败，请重试');
        return;
      }

      // 验证通过，继续提交
      navigate('/queren', { state: { formData } });
    } catch (error) {
      console.error('Turnstile verification error:', error);
      alert('验证服务出错，请重试');
    }
  };

  const handleShowIntro = () => {
    navigate('/jieshao');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>记录提交</h1>
        <div className="class-info">五年四班</div>
      </header>
      
      <main>
        <div className="verification-notice">
          ⚠️ 请先完成下方人机验证，再填写表单
        </div>

        <div className="turnstile-container">
          <div
            className="cf-turnstile"
            data-sitekey="YOUR_TURNSTILE_SITE_KEY"
            data-callback="handleTurnstileCallback"
            ref={turnstileRef}
          />
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
            <button type="submit" className="submit-button">保存</button>
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

      <noscript>
        <div className="noscript-warning">
          您需要启用 JavaScript 来运行此应用。
        </div>
      </noscript>
    </div>
  );
}

export default App; 