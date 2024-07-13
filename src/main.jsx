import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { StockProvider } from './context/StockContext'; // Import StockProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StockProvider>
      <App />
    </StockProvider>
  </React.StrictMode>,
);
