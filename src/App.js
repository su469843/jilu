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
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const widgetId = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // 修改 Turnstile 初始化
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (widgetId.current) {
        window.turnstile?.remove(widgetId.current);
      }
    };
  }, []);

  // 修改 Turnstile 渲染逻辑
  useEffect(() => {
    const renderTurnstile = () => {
      if (window.turnstile) {
        widgetId.current = window.turnstile.render('#turnstile-container', {
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
      }
    };

    if (turnstileLoaded) {
      renderTurnstile();
    }
  }, [turnstileLoaded]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const commitToGithub = async (note) => {
    try {
      const content = JSON.stringify(note, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${note.name}_${timestamp}.json`;
      
      console.log('Attempting to commit to GitHub...'); // 调试日志
      
      const response = await fetch('https://api.github.com/repos/su469843/jilu/contents/record/' + filename, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add record for ${note.name}`,
          content: btoa(unescape(encodeURIComponent(content))), // 修复中文编码问题
          branch: 'main'
        })
      });

      console.log('GitHub API Response:', response.status); // 调试日志

      if (!response.ok) {
        const errorData = await response.json();
        console.error('GitHub API Error:', errorData);
        throw new Error(errorData.message || 'Failed to commit to GitHub');
      }

      return true;
    } catch (error) {
      console.error('Error details:', error);
      setError(error.message);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const turnstileResponse = document.getElementById('turnstile-response').value;
      
      if (!formData.name.trim()) {
        alert('请输入姓名');
        return;
      }

      if (!turnstileResponse) {
        alert('请完成验证');
        return;
      }

      const note = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        confirmed: false
      };

      // 先保存到本地
      setNotes(prevNotes => [note, ...prevNotes]);

      // 提交到 GitHub
      const success = await commitToGithub(note);
      
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
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message);
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
              placeholder="姓"
              required
            />
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              placeholder="号数"
            />
          </div>
          <div className="form-group">
            <textarea
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="兴趣爱好..."
            />
            <textarea
              name="dreams"
              value={formData.dreams}
              onChange={handleChange}
              placeholder="梦想..."
            />
          </div>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="其他备注..."
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
      </main>
    </div>
  );
}

export default App; 