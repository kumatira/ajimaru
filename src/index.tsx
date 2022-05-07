import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Popup from './Popup';
import Options from './Options';

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById('popup') || document.createElement('div')
);

ReactDOM.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>,
  document.getElementById('options') || document.createElement('div')
);