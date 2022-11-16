import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '../../lib/carousel.css';
import './index.css';

const root = createRoot(document.getElementById('app')!);

root.render(<App />);
