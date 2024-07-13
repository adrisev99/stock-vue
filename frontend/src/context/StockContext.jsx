import React, { createContext, useContext, useState, useEffect } from 'react';

const StockContext = createContext();

export const useStock = () => {
  return useContext(StockContext);
};

export const StockProvider = ({ children }) => {
  const [selectedStocks, setSelectedStocks] = useState(() => {
    // Load from localStorage
    const savedStocks = localStorage.getItem('selectedStocks');
    return savedStocks ? JSON.parse(savedStocks) : [];
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('selectedStocks', JSON.stringify(selectedStocks));
  }, [selectedStocks]);

  const addStock = (stock) => {
    setSelectedStocks((prevStocks) => {
      if (prevStocks.find((s) => s.symbol === stock.symbol)) {
        return prevStocks; // Stock already exists, do not add again
      }
      return [...prevStocks, stock];
    });
  };

  const removeStock = (symbol) => {
    setSelectedStocks((prevStocks) => prevStocks.filter((stock) => stock.symbol !== symbol));
  };

  return (
    <StockContext.Provider value={{ selectedStocks, addStock, removeStock }}>
      {children}
    </StockContext.Provider>
  );
};
