import React, { useState } from 'react';
import { useProxyWatch, toProxy } from 'fanfanlo-deep-watcher';
import './App.css';

// 代码块组件
const CodeBlock: React.FC<{ code: string }> = ({ code }) => (
  <details style={{ margin: '10px 0', cursor: 'pointer' }}>
    <summary>查看代码</summary>
    <pre style={{
      background: '#f5f5f5',
      padding: '10px',
      borderRadius: '4px',
      overflowX: 'auto',
      marginTop: '10px'
    }}>
      <code>{code}</code>
    </pre>
  </details>
);

// 定义响应式数组类型
interface ReactiveArray<T> {
  items: T[];
  newItem: string;
}

// 创建多层嵌套的响应式对象
const nestedObj = toProxy({
  a: {
    b: {
      c: 3
    }
  }
});

// 创建响应式计数器对象
const counter = toProxy({ count: 0 });

/**
 * 演示：监听对象属性变化
 */
function CounterExample() {
  const [count] = useProxyWatch(counter, 'count', counter.count);

  const exampleCode = `
  
const counter = toProxy({ count: 0 });
function CounterExample() {
  const [count] = useProxyWatch(counter, 'count', counter.count);

  return (
    <div>
      <div>当前计数: {count}</div>
      <button onClick={() => counter.count++}>增加</button>
      <button onClick={() => counter.count--}>减少</button>
    </div>
  );
}`;

  return (
    <div className="example">
      <h3>1. 基础计数器</h3>
      <div className="description">
        这个示例展示了如何使用 toProxy 创建响应式计数器状态，并通过 useProxyWatch 监听状态变化。
        点击按钮可以增加或减少计数，界面会自动更新。
      </div>
      <CodeBlock code={exampleCode} />
      <div>当前计数: {count}</div>
      <div style={{ marginTop: '10px' }}>
        <button 
          onClick={() => counter.count++} 
          style={{ marginRight: '10px' }}
        >
          增加
        </button>
        <button onClick={() => counter.count--}>减少</button>
      </div>
    </div>
  );
}

/**
 * 演示：监听数组变化
 */
function TodoExample() {
  // 创建响应式数组
  const todoList = React.useMemo(() => toProxy({
    todos: [
      { id: 1, text: '学习 React', completed: false },
      { id: 2, text: '学习 TypeScript', completed: true },
      { id: 3, text: '学习 Deep Watcher', completed: false }
    ],
    newTodo: ''
  }), []);

  // 监听数组变化
  const [todos] = useProxyWatch(todoList, 'todos', todoList.todos);
  const [newTodo] = useProxyWatch(todoList, 'newTodo', todoList.newTodo);
  const [completedCount] = useProxyWatch(
    todoList, 
    'todos', 
    todoList.todos.filter(todo => todo.completed).length
  );

  // 添加新待办事项
  const addTodo = () => {
    if (todoList.newTodo.trim()) {
      todoList.todos = [
        ...todoList.todos,
        {
          id: Date.now(),
          text: todoList.newTodo,
          completed: false
        }
      ];
      todoList.newTodo = '';
    }
  };

  // 切换待办事项完成状态
  const toggleTodo = (id: number) => {
    todoList.todos = todoList.todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  };

  // 删除待办事项
  const removeTodo = (id: number) => {
    todoList.todos = todoList.todos.filter(todo => todo.id !== id);
  };

  // 清空已完成
  const clearCompleted = () => {
    todoList.todos = todoList.todos.filter(todo => !todo.completed);
  };

  const exampleCode = `// 创建响应式数组
const todoList = toProxy({
  todos: [
    { id: 1, text: '学习 React', completed: false },
    { id: 2, text: '学习 TypeScript', completed: true },
    { id: 3, text: '学习 Deep Watcher', completed: false }
  ],
  newTodo: ''
});

function TodoExample() {
  // 监听数组和计算属性
  const [todos] = useProxyWatch(todoList, 'todos', todoList.todos);
  const [completedCount] = useProxyWatch(
    todoList,
    'todos',
    todoList.todos.filter(todo => todo.completed).length
  );

  // 添加新待办事项
  const addTodo = () => {
    if (todoList.newTodo.trim()) {
      todoList.todos = [
        ...todoList.todos,
        {
          id: Date.now(),
          text: todoList.newTodo,
          completed: false
        }
      ];
      todoList.newTodo = '';
    }
  };

  // 切换待办事项状态
  const toggleTodo = (id) => {
    todoList.todos = todoList.todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  };

  // 删除待办事项
  const removeTodo = (id) => {
    todoList.todos = todoList.todos.filter(todo => todo.id !== id);
  };

  // 清空已完成
  const clearCompleted = () => {
    todoList.todos = todoList.todos.filter(todo => !todo.completed);
  };

  return (
    <div>
      <div>
        <input
          value={todoList.newTodo}
          onChange={(e) => todoList.newTodo = e.target.value}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="输入待办事项"
        />
        <button onClick={addTodo}>添加</button>
      </div>
      <div>已完成: {completedCount} / {todos.length}</div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => removeTodo(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
      <button onClick={clearCompleted}>清除已完成</button>
    </div>
  );
}`;

  return (
    <div className="example" style={{ marginTop: '20px' }}>
      <h3>2. 待办事项 (数组监听)</h3>
      <div className="description" style={{ marginBottom: '15px' }}>
        这个示例展示了如何监听和操作响应式数组。
        支持添加、删除、切换完成状态和清空已完成项。
      </div>
      <CodeBlock code={exampleCode} />
      <div style={{ margin: '10px 0' }}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => todoList.newTodo = e.target.value}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="输入待办事项"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button 
          onClick={addTodo}
          style={{ padding: '5px 10px' }}
        >
          添加
        </button>
      </div>
      <div style={{ margin: '10px 0' }}>
        已完成: <strong>{completedCount} / {todos.length}</strong>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map((todo: any) => (
          <li 
            key={todo.id} 
            style={{ 
              margin: '5px 0',
              padding: '5px',
              backgroundColor: todo.completed ? '#f0f0f0' : 'transparent',
              borderRadius: '3px'
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              style={{ marginRight: '10px' }}
            />
            <span 
              style={{ 
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#888' : '#333'
              }}
            >
              {todo.text}
            </span>
            <button 
              onClick={() => removeTodo(todo.id)}
              style={{
                marginLeft: '10px',
                fontSize: '12px',
                color: '#ff4d4f',
                background: 'none',
                border: '1px solid #ffa39e',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            >
              删除
            </button>
          </li>
        ))}
      </ul>
      {completedCount > 0 && (
        <button 
          onClick={clearCompleted}
          style={{
            marginTop: '10px',
            padding: '3px 8px',
            fontSize: '12px',
            color: '#666',
            background: 'none',
            border: '1px solid #d9d9d9',
            borderRadius: '2px',
            cursor: 'pointer'
          }}
        >
          清除已完成 ({completedCount})
        </button>
      )}
    </div>
  );
}

/**
 * 演示：监听多层嵌套对象变化
 */
function NestedObjectExample() {
  const [nestedValue] = useProxyWatch(nestedObj, 'a.b.c', nestedObj.a.b.c);
  const [inputValue, setInputValue] = React.useState('3');

  const updateNestedValue = () => {
    const numValue = Number(inputValue);
    if (!isNaN(numValue)) {
      nestedObj.a.b.c = numValue;
    }
  };

  const exampleCode = `// 创建多层嵌套的响应式对象
const nestedObj = toProxy({
  a: {
    b: {
      c: 3
    }
  }
});

function NestedObjectExample() {
  // 监听嵌套属性变化
  const [nestedValue] = useProxyWatch(nestedObj, 'a.b.c', nestedObj.a.b.c);
  
  // 更新嵌套属性
  const updateValue = () => {
    nestedObj.a.b.c = 5; // 可以直接修改深层属性
  };

  return (
    <div>
      <div>当前值: {nestedValue}</div>
      <button onClick={updateValue}>修改为5</button>
    </div>
  );
}`;

  return (
    <div className="example" style={{ marginTop: '20px' }}>
      <h3>3. 多层嵌套对象</h3>
      <div className="description" style={{ marginBottom: '15px' }}>
        这个示例展示了如何监听和修改多层嵌套对象的属性。
      </div>
      <CodeBlock code={exampleCode} />
      <div style={{ marginTop: '10px' }}>
        <div>当前值: a.b.c = {nestedValue}</div>
        <div style={{ marginTop: '10px' }}>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ marginRight: '10px' }}
          />
          <button onClick={updateNestedValue}>更新值</button>
        </div>
        <button 
          onClick={() => nestedObj.a.b.c++}
          style={{ marginTop: '10px', display: 'block' }}
        >
          值 +1
        </button>
      </div>
    </div>
  );
}

// 主示例组件
function UseProxyWatchExample() {
  return (
    <div>
      <CounterExample />
      <TodoExample />
      <NestedObjectExample />
    </div>
  );
}

// 主应用组件
const App: React.FC = () => {
  return (
    <div className="app">
      <UseProxyWatchExample />
    </div>
  );
};

export default App;
