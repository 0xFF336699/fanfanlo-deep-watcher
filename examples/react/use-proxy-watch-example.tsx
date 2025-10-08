import React, { useState } from 'react';
import { useProxyWatch, toProxy } from '../../src';

// 定义用户类型
interface User {
  id: number;
  name: string;
  email: string;
  profile?: {
    bio: string;
    website?: string;
  };
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

// 创建可监听的用户数据
const userData = toProxy<User>({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  profile: {
    bio: 'Frontend developer',
    website: 'https://example.com'
  },
  preferences: {
    theme: 'light',
    notifications: true
  }
});

// 用户信息组件
const UserProfile: React.FC = () => {
  // 使用 useProxyWatch 监听用户名称
  const [name] = useProxyWatch(userData, 'name', userData.name);
  
  // 使用 useProxyWatch 监听用户邮箱
  const [email] = useProxyWatch(userData, 'email', userData.email);
  
  // 使用 useProxyWatch 监听嵌套属性
  const [bio] = useProxyWatch(
    userData, 
    'profile.bio', 
    userData.profile?.bio || ''
  );
  
  // 使用 useProxyWatch 监听主题偏好
  const [theme] = useProxyWatch(
    userData,
    'preferences.theme',
    userData.preferences?.theme || 'light'
  );

  // 处理名称更新
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    userData.name = e.target.value;
  };

  // 处理个人简介更新
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (userData.profile) {
      userData.profile.bio = e.target.value;
    }
  };

  // 切换主题
  const toggleTheme = () => {
    if (userData.preferences) {
      userData.preferences.theme = 
        userData.preferences.theme === 'light' ? 'dark' : 'light';
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: theme === 'dark' ? '#333' : '#fff',
      color: theme === 'dark' ? '#fff' : '#333',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h1>用户资料</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>基本信息</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>姓名: </label>
          <input 
            type="text" 
            value={name} 
            onChange={handleNameChange}
            style={{
              padding: '5px',
              marginLeft: '10px',
              backgroundColor: theme === 'dark' ? '#555' : '#fff',
              color: theme === 'dark' ? '#fff' : '#333',
              border: '1px solid #ccc'
            }}
          />
        </div>
        <div>
          <label>邮箱: </label>
          <span>{email}</span>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>个人简介</h3>
        <textarea
          value={bio}
          onChange={handleBioChange}
          style={{
            width: '100%',
            height: '100px',
            padding: '10px',
            backgroundColor: theme === 'dark' ? '#555' : '#fff',
            color: theme === 'dark' ? '#fff' : '#333',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>
      
      <div>
        <h3>偏好设置</h3>
        <button 
          onClick={toggleTheme}
          style={{
            padding: '8px 16px',
            backgroundColor: theme === 'dark' ? '#555' : '#e0e0e0',
            color: theme === 'dark' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          切换主题 (当前: {theme === 'dark' ? '深色' : '浅色'})
        </button>
      </div>
      
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: theme === 'dark' ? '#444' : '#f5f5f5', borderRadius: '4px' }}>
        <h3>当前状态</h3>
        <pre style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          backgroundColor: theme === 'dark' ? '#222' : '#f0f0f0',
          padding: '10px',
          borderRadius: '4px',
          overflowX: 'auto'
        }}>
          {JSON.stringify(userData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// 主应用组件
const App: React.FC = () => {
  return (
    <div className="app">
      <UserProfile />
    </div>
  );
};

export default App;
