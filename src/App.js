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
    interests: '',
    dreams: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const widgetId = useRef(null);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // 修改 Turnstile 初始化
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    
    let currentWidgetId = null; // 在 effect 内部创建引用

    script.onload = () => {
      // 脚本加载完成后直接渲染
      currentWidgetId = window.turnstile.render('#turnstile-container', {
        sitekey: '0x4AAAAAAA2BDJ8F9WxaTiZn',
        theme: 'light',
        callback: function(token) {
          console.log('Challenge Success!', token);
          document.getElementById('turnstile-response').value = token;
        },
        'expired-callback': () => {
          document.getElementById('turnstile-response').value = '';
        },
        'error-callback': () => {
          document.getElementById('turnstile-response').value = '';
        }
      });
      widgetId.current = currentWidgetId;
    };

    document.body.appendChild(script);

    return () => {
      if (currentWidgetId) {
        window.turnstile?.remove(currentWidgetId);
      }
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    document.title = "班级采访 - 你的梦想是什么？";
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
兴趣爱好: ${note.interests}
梦想: ${note.dreams}
备注: ${note.content || '无'}
提交时间: ${new Date().toLocaleString()}
      `;

      // 使用 fetch 直接发送到邮箱服务器
      const response = await fetch('https://smtphz.qiye.163.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('su@one-mail.us.kg:YOUR_PASSWORD'),
        },
        body: JSON.stringify({
          from: 'su@one-mail.us.kg',
          to: 'su@one-mail.us.kg',
          subject: `新的记录提交 - ${note.name}`,
          text: emailContent
        })
      });

      if (!response.ok) {
        throw new Error('发送邮件失败');
      }

      return true;
    } catch (error) {
      console.error('Email error:', error);
      setError('发送邮件失败，请稍后重试');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // 使用 validateForm 进行表单验证
      const validationError = validateForm();
      if (validationError) {
        alert(validationError);
        setIsSubmitting(false);
        return;
      }

      const turnstileResponse = document.getElementById('turnstile-response').value;
      
      if (!turnstileResponse) {
        alert('请完成验证');
        setIsSubmitting(false);
        return;
      }

      const note = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        confirmed: false
      };

      // 保存到本地
      setNotes(prevNotes => [note, ...prevNotes]);

      // 发送邮件
      const success = await sendEmail(note);
      
      if (success) {
        setFormData({
          name: '',
          number: '',
          interests: '',
          dreams: '',
          content: ''
        });

        // 重置 Turnstile
        if (widgetId.current) {
          window.turnstile.reset(widgetId.current);
        }

        alert('提交成功！');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || '提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = (noteId) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, confirmed: true }
        : note
    ));
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
          <p className="contact-info">有问题邮件请发给 <a href="mailto:54@2020classes4.us.kg">54@2020classes4.us.kg</a></p>
          
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
        <h1>个人记录本</h1>
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
                {!note.confirmed ? (
                  <button 
                    className="confirm-button"
                    onClick={() => handleConfirm(note.id)}
                  >
                    确认
                  </button>
                ) : (
                  <span className="confirmed-badge">已确认</span>
                )}
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