import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Set the initial theme
const root = document.getElementById('root') as HTMLElement;
document.documentElement.setAttribute('data-theme', 'light');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
