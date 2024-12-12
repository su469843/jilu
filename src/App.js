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

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // 初始化 Turnstile
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => setTurnstileLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (widgetId.current) {
        window.turnstile?.remove(widgetId.current);
      }
    };
  }, []);

  // Turnstile 加载完成后渲染挑战
  useEffect(() => {
    if (turnstileLoaded && window.turnstile) {
      window.turnstile.ready(() => {
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
      });
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
      // 准备提交的数据
      const content = JSON.stringify(note, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${note.name}_${timestamp}.json`;
      
      // 使用 GitHub API 提交文件
      const response = await fetch('https://api.github.com/repos/su469843/jilu/contents/record/' + filename, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer YOUR_GITHUB_TOKEN',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add record for ${note.name}`,
          content: btoa(content), // 将内容转换为 base64
          branch: 'main'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to commit to GitHub');
      }

      console.log('Successfully committed to GitHub');
    } catch (error) {
      console.error('Error committing to GitHub:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const turnstileResponse = document.getElementById('turnstile-response').value;
    
    if (!formData.name.trim() || !turnstileResponse) {
      alert('请完成验证');
      return;
    }

    const note = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      confirmed: false
    };

    setNotes([note, ...notes]);
    
    // 提交到 GitHub
    await commitToGithub(note);

    setFormData({
      name: '',
      number: '',
      interests: '',
      dreams: '',
      content: ''
    });

    if (widgetId.current) {
      window.turnstile.reset(widgetId.current);
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
          
          {/* Turnstile 容器 */}
          <div id="turnstile-container"></div>
          <input type="hidden" id="turnstile-response" name="cf-turnstile-response" />
          
          <button type="submit">保存</button>
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