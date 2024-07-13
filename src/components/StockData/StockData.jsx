import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart } from '@tremor/react';
import { format } from 'date-fns';
import { ButtonsCard } from '../ui/tailwindcss-buttons';
import { useStock } from '../../context/StockContext';
import './StockData.css';

function StockData() {
  const [chartData, setChartData] = useState([]);
  const [intradayData, setIntradayData] = useState([]);
  const [stockInfo, setStockInfo] = useState({});
  const [stockSymbol, setStockSymbol] = useState('AAPL');
  const [error, setError] = useState('');
  const { addStock } = useStock();

  useEffect(() => {
    const interval = setInterval(() => {
      if (stockSymbol) {
        fetchIntradayData(stockSymbol);
      }
    }, 60000); // Fetch data every minute

    return () => clearInterval(interval);
  }, [stockSymbol]);

  const fetchIntradayData = (symbol) => {
    axios.get(`http://127.0.0.1:5000/intraday/${symbol}`)
      .then(response => {
        const formattedData = response.data.map(item => ({
          time: item.Time,
          price: item.Price
        })).reverse();
        setIntradayData(formattedData);
        setError('');
      })
      .catch(error => {
        console.error('Error fetching intraday data:', error);
        setError('Stock symbol not found or no valid intraday data available.');
      });
  };

  const fetchData = (symbol) => {
    axios.get(`http://127.0.0.1:5000/historical/${symbol}`)
      .then(response => {
        const data = response.data;
        if (data.error) {
          throw new Error(data.error);
        }
        const formattedData = data.history
          .map(item => ({
            date: format(new Date(item.Date), 'MMM yyyy'),
            close: item.Close,
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setChartData(formattedData);
        setStockInfo({
          name: data.name,
          sector: data.sector,
          industry: data.industry,
        });
        setIntradayData([]);
        setError('');
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Stock symbol not found or no valid data available.');
      });
  };

  const handleInputChange = (e) => {
    setStockSymbol(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    fetchData(stockSymbol);
    fetchIntradayData(stockSymbol);
  };

  const handleAddToDashboard = () => {
    addStock({
      symbol: stockSymbol,
      chartData,
      stockInfo,
    });
  };

  const valueFormatter = (number) => {
    return '$ ' + new Intl.NumberFormat('us').format(number).toString();
  };

  return (
    <div className="stockdata-container">
      <form onSubmit={handleFormSubmit} className="stockdata-form">
        <input
          type="text"
          value={stockSymbol}
          onChange={handleInputChange}
          placeholder="Enter stock symbol"
          className="stockdata-input bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600"
        />
        <ButtonsCard onClick={handleFormSubmit} className="flex-shrink-0">
          Fetch Data
        </ButtonsCard>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {stockInfo.name && (
        <div className="stockdata-info">
          <h2>{stockInfo.name}</h2>
          <p>Sector: {stockInfo.sector}</p>
          <p>Industry: {stockInfo.industry}</p>
          <ButtonsCard onClick={handleAddToDashboard} className="flex-shrink-0 mt-4">
            Add to Dashboard
          </ButtonsCard>
        </div>
      )}
      <div className="chart-container">
        <h3 className="text-lg font-medium text-tremor-content-strong dark:text-blue-600 mb-4">
          {stockSymbol.toUpperCase()} Close Prices Over Time (USD)
        </h3>
        {chartData.length > 0 ? (
          <AreaChart
            className="area-chart"
            data={chartData}
            index="date"
            yAxisWidth={65}
            categories={['close']}
            colors={['indigo']}
            valueFormatter={valueFormatter}
            showAnimation={true}
            animationDuration={900}
          />
        ) : (
          !error && <p>Loading data...</p>
        )}
      </div>
      <div className="chart-container">
        <h3 className="text-lg font-medium text-tremor-content-strong dark:text-blue-600 mb-4">
          Real-Time Prices (USD) - Past Day
        </h3>
        {intradayData.length > 0 ? (
          <AreaChart
            className="area-chart"
            data={intradayData}
            index="time"
            yAxisWidth={65}
            categories={['price']}
            colors={['red']}
            valueFormatter={valueFormatter}
            showAnimation={true}
            animationDuration={900}
            autoMinValue={true}
          />
        ) : (
          !error && <p>Loading data...</p>
        )}
      </div>
    </div>
  );
}

export default StockData;
