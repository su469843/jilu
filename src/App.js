import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotFound from './components/NotFound';
import ErrorPage from './components/ErrorPage';
import Intro from './components/Intro';
import Confirm from './components/Confirm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainForm />} errorElement={<ErrorPage />} />
        <Route path="/jieshao" element={<Intro />} />
        <Route path="/queren" element={<Confirm />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
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
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleShowIntro = () => {
    navigate('/jieshao');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!showConfirmation) {
      // ... 验证逻辑 ...
      navigate('/queren', { state: { formData } });
      return;
    }
    // ... 其他提交逻辑 ...
  };

  return (
    // ... 组件渲染代码 ...
  );
}

export default MainForm; 