import React from 'react';
import './App.css';
import { Arr } from './examples/Arr';
import { PetName } from './examples/PetName';


const App: React.FC = () => {
  return (
    <div className="app">
      <h1>Deep Watcher Examples</h1>
      <PetName />
      <Arr />
      <div>
        <a href="https://github.com/0xFF336699/fanfanlo-deep-watcher">github</a>
      </div>
    </div>
  );
};

export default App;
