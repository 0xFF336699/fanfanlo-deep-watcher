import React, { useState, useEffect } from 'react';
import { proxyWatch, useProxyWatch } from 'deep-watcher';
import './App.css';

// Define types for our example
type User = {
  id: number;
  name: string;
  details: {
    email: string;
    address: {
      city: string;
      country: string;
    };
  };
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
};

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const App: React.FC = () => {
  // Example 1: Basic object property watch with React state
  const [user, setUser] = useState<User>({
    id: 1,
    name: 'John Doe',
    details: {
      email: 'john@example.com',
      address: {
        city: 'New York',
        country: 'USA'
      }
    }
  });

  // Example 2: Array operations with React state
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Master TypeScript', completed: false },
  ]);

  // Example 3: Using the useProxyWatch hook
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [themeLog, setThemeLog] = useState<string[]>([]);

  // Example 4: Watching nested properties
  const [formData, setFormData] = useState({
    personal: {
      firstName: '',
      lastName: '',
    },
    contact: {
      email: '',
      phone: '',
    },
  });

  // Example 1: Watch for changes to user's city
  useEffect(() => {
    const { unwatch } = proxyWatch(
      user,
      'details.address.city',
      (newCity:string, oldCity?:string) => {
        console.log(`City changed from "${oldCity}" to "${newCity}"`);
      }
    );

    return () => unwatch();
  }, [user]);

  // Example 2: Watch for changes to todos array
  useEffect(() => {
    const { unwatch } = proxyWatch(
      todos,
      'length',
      (newLength:number, oldLength?:number) => {
        console.log(`Todo list length changed from ${oldLength} to ${newLength}`);
      }
    );

    return () => unwatch();
  }, [todos]);

  // Example 3: Using useProxyWatch hook
  const [themeValue] = useProxyWatch(
    { theme },
    'theme',
    theme
  );

  // Example 4: Watching form data with debouncing
  const [formLog, setFormLog] = useState<string[]>([]);
  
  useEffect(() => {
    const { unwatch } = proxyWatch(
      formData,
      'personal.firstName',
      (newValue:string, oldValue?:string) => {
        const message = `First name changed to: ${newValue}`;
        setFormLog(prev => [message, ...prev].slice(0, 5));
      }
    );

    return () => unwatch();
  }, [formData]);

  // Handler functions
  const updateUserCity = () => {
    const cities = ['Tokyo', 'London', 'Paris', 'Sydney', 'Berlin'];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    
    setUser(prev => ({
      ...prev,
      details: {
        ...prev.details,
        address: {
          ...prev.details.address,
          city: randomCity
        }
      }
    }));
  };

  const addTodo = () => {
    const newTodo = {
      id: Date.now(),
      text: `New Todo ${todos.length + 1}`,
      completed: false,
    };
    setTodos(prev => [...prev, newTodo]);
  };

  const toggleTodo = (id: number) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  return (
    <div className="app">
      <h1>Deep Watcher React Example</h1>
      
      <section className="example">
        <h2>1. Watching Object Properties</h2>
        <div className="card">
          <p>User: {user.name}</p>
          <p>Email: {user.details.email}</p>
          <p>Location: {user.details.address.city}, {user.details.address.country}</p>
          <button onClick={updateUserCity}>Change City</button>
          <p className="hint">Check browser console for change logs</p>
        </div>
      </section>

      <section className="example">
        <h2>2. Watching Array Operations</h2>
        <div className="card">
          <button onClick={addTodo}>Add Todo</button>
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
              </li>
            ))}
          </ul>
          <p className="hint">Check browser console for change logs</p>
        </div>
      </section>

      <section className="example">
        <h2>3. Using useProxyWatch Hook</h2>
        <div className="card">
          <p>Current theme: {theme}</p>
          <button onClick={toggleTheme}>Toggle Theme</button>
          <div className="log">
            <h4>Theme Change Log:</h4>
            {themeLog.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="example">
        <h2>4. Form Field Watching</h2>
        <div className="card">
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              name="personal.firstName"
              value={formData.personal.firstName}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              name="personal.lastName"
              value={formData.personal.lastName}
              onChange={handleInputChange}
            />
          </div>
          <div className="log">
            <h4>Change Log:</h4>
            {formLog.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
