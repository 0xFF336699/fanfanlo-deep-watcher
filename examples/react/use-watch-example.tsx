import React, { useState, useEffect } from 'react';
import { useWatch } from '../../src';

// 创建一个简单的可观察对象
class ObservableUser {
  private _name: string;
  private listeners: Array<() => void> = [];

  constructor(name: string) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  set name(value: string) {
    if (this._name !== value) {
      this._name = value;
      this.notifyListeners();
    }
  }

  // 添加监听器
  addListener(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // 通知所有监听器
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // 更新用户信息的方法
  updateName(newName: string) {
    this.name = newName;
  }
}

// 用户信息组件
const UserInfo: React.FC<{ user: ObservableUser }> = ({ user }) => {
  // 使用 useWatch 监听 user.name 的变化
  const [name] = useWatch(user, 'name');
  
  // 用于强制组件重新渲染
  const [count, setCount] = useState(0);
  
  // 添加一个效果来监听 user 对象的变化
  useEffect(() => {
    const unsubscribe = user.addListener(() => {
      // 当 user 触发更新时，增加计数以强制重新渲染
      setCount(prev => prev + 1);
    });
    
    return () => {
      unsubscribe();
    };
  }, [user]);

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      maxWidth: '400px',
      margin: '20px auto',
      textAlign: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2>用户信息</h2>
      <div style={{ margin: '15px 0' }}>
        <div style={{ marginBottom: '10px' }}>
          <strong>用户名:</strong> {name}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={() => user.updateName(`用户_${Math.floor(Math.random() * 1000)}`)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            随机更改用户名
          </button>
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          组件渲染次数: {count}
        </div>
      </div>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '4px',
        textAlign: 'left',
        fontSize: '14px'
      }}>
        <div><strong>当前状态:</strong></div>
        <pre style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify({ name }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// 计数器组件
const Counter: React.FC<{ user: ObservableUser }> = ({ user }) => {
  // 使用 useWatch 监听 user.name 的变化
  const [name] = useWatch(user, 'name');
  const [nameLength, setNameLength] = useState(name.length);
  
  useEffect(() => {
    // 当 name 变化时更新名称长度
    setNameLength(name.length);
  }, [name]);
  
  return (
    <div style={{
      margin: '20px auto',
      padding: '15px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      maxWidth: '400px',
      textAlign: 'center',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>用户名长度计数器</h3>
      <p>当前用户名 "{name}" 的长度是: <strong>{nameLength}</strong></p>
      <p style={{
        fontSize: '12px',
        color: '#666',
        fontStyle: 'italic'
      }}>
        这个组件使用 useWatch 监听用户名的变化
      </p>
    </div>
  );
};

// 主应用组件
const App: React.FC = () => {
  // 创建一个可观察的用户实例
  const [user] = useState(() => new ObservableUser('张三'));
  
  return (
    <div className="app" style={{ fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>useWatch 示例</h1>
      <UserInfo user={user} />
      <Counter user={user} />
      
      <div style={{
        maxWidth: '600px',
        margin: '30px auto',
        padding: '15px',
        backgroundColor: '#f0f7ff',
        borderRadius: '8px',
        borderLeft: '4px solid #4a90e2'
      }}>
        <h3>使用说明</h3>
        <p>这个示例展示了如何使用 <code>useWatch</code> 钩子来监听对象属性的变化。</p>
        <ol style={{ textAlign: 'left', paddingLeft: '20px' }}>
          <li>点击"随机更改用户名"按钮会更新用户名称</li>
          <li>UserInfo 组件使用 useWatch 监听用户名的变化</li>
          <li>Counter 组件也使用 useWatch 监听相同的属性</li>
          <li>当用户名变化时，两个组件都会自动更新</li>
        </ol>
      </div>
    </div>
  );
};

export default App;
