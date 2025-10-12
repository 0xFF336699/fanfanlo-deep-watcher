import React from 'react';
import './App.css';
import { Arr } from './examples/Arr';
import { PetName } from './examples/PetName';
import { runExamples } from './examples/proxyWatch.example';
import { Js } from './examples/Js';


runExamples();
const App: React.FC = () => {
  return (
    <div className="app">
      <h1>Deep Watcher Examples</h1>
      <h3>You can press F12 in your browser to open the developer tools and check the output in the console.</h3>
      <Js />
      <h2>React</h2>
      <PetName />
      <Arr />
      <div>
        <a href="https://github.com/0xFF336699/fanfanlo-deep-watcher">github</a>
      </div>
    </div>
  );
};

export default App;
