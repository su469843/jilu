import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import NotFound from './components/NotFound';
import ErrorPage from './components/ErrorPage';
import Intro from './components/Intro';
import Confirm from './components/Confirm';

function App() {
  return (
    <Routes>
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

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/queren', { state: { formData } });
  };

  const handleShowIntro = () => {
    navigate('/jieshao');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>班级梦想采访</h1>
        <div className="class-info">五年四班</div>
      </header>
      
      <main>
        <form onSubmit={handleSubmit}>
          {/* 表单内容 */}
          <button type="submit">提交</button>
        </form>
        
        <button onClick={handleShowIntro}>
          查看介绍
        </button>
      </main>
    </div>
  );
}

export default App; 