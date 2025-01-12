import React from 'react';
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

// 将原来的主要内容移到新组件
function MainForm() {
  const handleShowIntro = () => {
    navigate('/jieshao');
  };

  if (!showConfirmation) {
    // ... 验证逻辑 ...
    navigate('/queren', { state: { formData } });
    return;
  }
}

export default App; 