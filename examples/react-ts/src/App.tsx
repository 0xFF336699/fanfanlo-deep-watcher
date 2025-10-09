import React from 'react';
import './App.css';
import { Arr } from './examples/Arr';
import { PetName } from './examples/PetName';


const App: React.FC = () => {
  return (
    <div className="app">
      <PetName />
      <Arr />
    </div>
  );
};

export default App;
