import React from 'react';
import { Link } from 'react-router-dom';

function Intro() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>介绍文档</h1>
        <div className="class-info">五年四班</div>
      </header>
      
      <main className="intro-content">
        <p>这是五年四班课代表做的调查问卷，<em>至少现在是</em></p>
        <p>我们会全程保密，不会泄露隐私</p>
        <p>但是要如实填写，被发现一律封IP</p>
        <p>想做一个调查，你们想发给自己这些你小学时的梦想吗？</p>
        <p>谢谢</p>
        
        {/* 其他介绍内容... */}
        
        <Link to="/" className="back-button">
          返回填写
        </Link>
      </main>
    </div>
  );
}

export default Intro; 