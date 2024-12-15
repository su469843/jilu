import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    phone: '',
    interests: '',
    dreams: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const widgetId = useRef(null);
  const [showIntro, setShowIntro] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // 修改 Turnstile 初始化
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = false;
    script.defer = false;
    
    let currentWidgetId = null;

    const renderTurnstile = () => {
      if (window.turnstile && document.getElementById('turnstile-container')) {
        try {
          // 先清除旧的实例
          if (currentWidgetId) {
            try {
              window.turnstile.remove(currentWidgetId);
            } catch (e) {
              console.error('Failed to remove old widget:', e);
            }
          }

          // 创建新实例
          currentWidgetId = window.turnstile.render('#turnstile-container', {
            sitekey: '0x4AAAAAAA2BDJ8F9WxaTiZn',
            theme: 'light',
            callback: function(token) {
              console.log('Challenge Success!', token);
              const responseInput = document.getElementById('turnstile-response');
              if (responseInput) {
                responseInput.value = token;
              }
            },
            'expired-callback': () => {
              const responseInput = document.getElementById('turnstile-response');
              if (responseInput) {
                responseInput.value = '';
              }
              // 过期时重新渲染
              setTimeout(renderTurnstile, 0);
            },
            'error-callback': () => {
              const responseInput = document.getElementById('turnstile-response');
              if (responseInput) {
                responseInput.value = '';
              }
              console.error('Turnstile error occurred');
            }
          });
          widgetId.current = currentWidgetId;
        } catch (error) {
          console.error('Turnstile render error:', error);
        }
      }
    };

    script.onload = renderTurnstile;
    document.body.appendChild(script);

    // 清理函数
    return () => {
      if (currentWidgetId) {
        try {
          window.turnstile?.remove(currentWidgetId);
        } catch (error) {
          console.error('Turnstile cleanup error:', error);
        }
      }
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    document.title = "班级采访 - 你的梦想是什么？";
  }, []);

  // 添加管理员状态检查
  useEffect(() => {
    const savedAdminStatus = localStorage.getItem('isAdmin');
    if (savedAdminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sendEmail = async (note) => {
    try {
      const emailContent = `
姓名: ${note.name}
号数: ${note.number}
手机号: ${note.phone || '未填写'}
兴趣爱好: ${note.interests}
梦想: ${note.dreams}
备注: ${note.content || '无'}
提交时间: ${new Date().toLocaleString()}
      `;

      // 使用 Cloudflare Worker 发送邮件
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: `新的记录提交 - ${note.name}`,
          text: emailContent
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '发送邮件失败');
      }

      return true;
    } catch (error) {
      console.error('Email error:', error);
      setError('发送邮件失败，请稍后重试');
      return false;
    }
  };

  // 检查 IP 是否已提交
  const checkIPSubmission = async () => {
    try {
      const response = await fetch('/api/check-ip');
      const data = await response.json();
      
      if (!data.canSubmit) {
        setError('每个 IP 只能提交一次。如果您是管理员，请点击"我是测试"进行登录。');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Check IP error:', error);
      setError('检查 IP 失败，请稍后重试');
      return false;
    }
  };

  // 管理员登录
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username === '1234' && loginData.password === 'suyuhang2013') {
      setIsAdmin(true);
      setShowLogin(false);
      localStorage.setItem('isAdmin', 'true');
    } else {
      alert('账号或密码错误');
    }
  };

  // 修改提交处理
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 先验证表单
      const validationError = validateForm();
      if (validationError) {
        alert(validationError);
        return;
      }

      // 检查 Turnstile
      const turnstileResponse = document.getElementById('turnstile-response').value;
      if (!turnstileResponse) {
        alert('请完成验证');
        return;
      }

      // 如果不是管理员，检查 IP
      if (!isAdmin) {
        const canSubmit = await checkIPSubmission();
        if (!canSubmit) {
          return;
        }
      }

      const note = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        confirmed: false
      };

      // 同时发送邮件和保存到 KV
      const [emailSuccess, kvSuccess] = await Promise.all([
        sendEmail(note),
        saveToKV(note)
      ]);
      
      if (emailSuccess && kvSuccess) {
        resetForm();
        alert('提交成功！');
      } else {
        throw new Error(emailSuccess ? 'KV 存储失败' : '邮件发送失败');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(`提交失败: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 添加保存到 KV 的函数
  const saveToKV = async (note) => {
    try {
      const response = await fetch('/api/save-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note)
      });

      if (!response.ok) {
        throw new Error('保存到 KV 失败');
      }

      return true;
    } catch (error) {
      console.error('Save to KV error:', error);
      return false;
    }
  };

  const handleShowIntro = () => {
    setShowIntro(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return '请输入姓名';
    if (!formData.number.trim()) return '请输入号数';
    if (!formData.interests.trim()) return '请填写兴趣爱好';
    if (!formData.dreams.trim()) return '请填写梦想';
    return null;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      number: '',
      phone: '',
      interests: '',
      dreams: '',
      content: ''
    });

    // 重置 Turnstile
    if (widgetId.current) {
      try {
        window.turnstile.reset(widgetId.current);
      } catch (error) {
        console.error('Failed to reset Turnstile:', error);
        // 如果重置失败，重新加载页面
        window.location.reload();
      }
    }
  };

  // 登录界面
  if (showLogin) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>管理员登录</h1>
        </header>
        <main className="login-content">
          <form onSubmit={handleLogin} autoComplete="off">
            <div className="input-group">
              <input
                type="text"
                placeholder="账号"
                value={loginData.username}
                onChange={(e) => setLoginData(prev => ({...prev, username: e.target.value}))}
                autoComplete="off"
                readOnly
                onFocus={(e) => e.target.removeAttribute('readonly')}
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="密码"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({...prev, password: e.target.value}))}
                autoComplete="off"
                readOnly
                onFocus={(e) => e.target.removeAttribute('readonly')}
              />
            </div>
            <button type="submit">登录</button>
          </form>
          <button className="back-button" onClick={() => setShowLogin(false)}>
            返回
          </button>
        </main>
      </div>
    );
  }

  // 修改介绍文档
  if (showIntro) {
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
          <p className="contact-info">
            有问题邮件请发给 <a href="mailto:54@2020classes4.us.kg">54@2020classes4.us.kg</a>
            <span className="admin-link" onClick={() => setShowLogin(true)}>我是测试</span>
          </p>

          <div className="terms-section">
            <h2>条款</h2>
            <div className="terms-content">
              <p>有效日期：2024 年 9 月 26 日</p>
              <p>欢迎使用我们的调查问卷系统。请仔细阅读以下内容，因为这会影响您的合法权利。</p>
              
              <h3>1. 合格</h3>
              <p>通过使用本系统，您声明：(i) 您已年满十八 (18) 岁；(ii) 您之前没有被封禁；(iii) 您的使用符合所有适用法律。</p>
              
              <h3>2. 数据使用</h3>
              <p>您提交的信息将：(i) 仅用于研究目的；(ii) 严格保密；(iii) 不会向第三方披露。</p>
              
              <h3>3. IP 限制</h3>
              <p>每个 IP 地址仅允许提交一次。违规账户将被永久封禁。</p>
              
              <h3>4. 隐私保护</h3>
              <p>我们采用多重措施保护您的信息：(i) 数据加密存储；(ii) 访问权限控制；(iii) 定期安全审计。</p>
              
              <h3>5. 禁止行为</h3>
              <p>禁止：(i) 提供虚假信息；(ii) 恶意攻击系统；(iii) 干扰他人使用。</p>
              
              <h3>6. 终止条款</h3>
              <p>我们保留随时终止任何用户访问权限的权利，无需事先通知。</p>
            </div>
          </div>
          
          <button className="back-button" onClick={() => setShowIntro(false)}>
            返回填写
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>记录提交</h1>
      </header>
      
      <main>
        {error && (
          <div className="error-message">
            错误: {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="姓名"
              required
            />
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              placeholder="号数"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="手机号（选填）"
              className="full-width"
            />
          </div>
          <div className="form-group">
            <textarea
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="兴趣爱好..."
              required
            />
            <textarea
              name="dreams"
              value={formData.dreams}
              onChange={handleChange}
              placeholder="梦想..."
              required
            />
          </div>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="其他备注（选填）..."
            className="full-width"
          />
          
          <div id="turnstile-container"></div>
          <input type="hidden" id="turnstile-response" name="cf-turnstile-response" />
          
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </form>

        <div className="notes-list">
          {notes.map(note => (
            <div key={note.id} className="note">
              <div className="note-header">
                <h3>{note.name}</h3>
                <span className="number">#{note.number}</span>
              </div>
              <div className="note-content">
                <p><strong>兴趣爱好：</strong>{note.interests}</p>
                <p><strong>梦想：</strong>{note.dreams}</p>
                {note.content && <p><strong>备注：</strong>{note.content}</p>}
              </div>
              <div className="note-footer">
                <small>{new Date(note.createdAt).toLocaleString()}</small>
              </div>
            </div>
          ))}
        </div>

        <div className="privacy-link">
          <p>
            别担心，我们全程保密！
            <span className="link" onClick={handleShowIntro}>
              点此查看
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}

export default App; 