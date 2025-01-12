import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import NotFound from './components/NotFound';
import ErrorPage from './components/ErrorPage';
import Intro from './components/Intro';
import Confirm from './components/Confirm';

function App() {
  return (
    <Routes basename="/">
      <Route path="/" element={<MainForm />} errorElement={<ErrorPage />} />
      <Route path="/jieshao" element={<Intro />} />
      <Route path="/queren" element={<Confirm />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function MainForm() {
  const navigate = useNavigate();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('../queren', { state: { formData }, relative: true });
  };

  const handleShowIntro = () => {
    navigate('../jieshao', { relative: true });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>班级梦想采访</h1>
        <div className="class-info">五年四班</div>
      </header>
      
      <main>
        <form onSubmit={handleSubmit} className="dream-form">
          <div className="form-group">
            <label htmlFor="name">姓名：</label>
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
            <label htmlFor="number">号数：</label>
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
            <label htmlFor="interests">兴趣爱好：</label>
            <textarea
              id="interests"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dreams">梦想：</label>
            <textarea
              id="dreams"
              name="dreams"
              value={formData.dreams}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">手机号（选填）：</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">备注（选填）：</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-button">提交</button>
            <button type="button" onClick={handleShowIntro} className="intro-button">
              查看介绍
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