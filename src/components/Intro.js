import React from 'react';
import { useNavigate } from 'react-router-dom';

function Intro() {
  const navigate = useNavigate();
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>介绍文档</h1>
        <div className="class-info">五年四班</div>
      </header>
      
      <main className="intro-content">
        <section className="intro-section">
          <p>这是五年四班课代表做的调查问卷，<em>至少现在是</em></p>
          <p>我们会全程保密，不会泄露隐私</p>
          <p>但是要如实填写，被发现一律封IP</p>
          <p>想做一个调查，你们想发给自己这些你小学时的梦想吗？</p>
          <p>谢谢</p>
        </section>

        <section className="contact-section">
          <p>有邮件请发给 54@2020classes4.us.kg</p>
        </section>

        <section className="terms-section">
          <h2>条款</h2>
          <p className="terms-date">生效日期：2024 年 9 月 26 日</p>
          
          <p>欢迎使用我的调查问卷系统。请仔细阅读以下内容，因为这会影响您的合法权利。</p>
          
          <h3>1. 合格</h3>
          <p>通过使用本系统，您声明：(i) 您已年满十二 (12) 岁；</p>
          
          <h3>2. 数据使用</h3>
          <p>您提交的信息将：(i) 仅用于研究目的；(ii) 严格保密；(iii) 不会向第三方披露。</p>
          
          <h3>3. IP 限制</h3>
          <p>每个 IP 地址最多允许提交两次。违规账户将被永久封禁！</p>
          
          <h3>4. 隐私保护</h3>
          <p>我们采用多重措施保护您的信息：(i) 数据加密存储；(ii) 访问权限控制；(iii) 定期安全审计。</p>
          
          <h3>5. 禁止行为</h3>
          <p>禁止(i) 提供虚假信息；(ii) 恶意攻击系统；(iii) 干扰他人使用。</p>
          
          <h3>6. 终止条款</h3>
          <p>我们保留随时终止任何用户访问权限的权利，无需事先通知。</p>
        </section>
        
        <button onClick={() => navigate('/')} className="back-button">
          返回填写
        </button>
      </main>
    </div>
  );
}

export default Intro; 