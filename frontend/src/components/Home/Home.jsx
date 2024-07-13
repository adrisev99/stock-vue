import React from 'react';
import { CardContainer, CardBody, CardItem } from '../ui/3d-card';
import { useStock } from '../../context/StockContext';
import { AreaChart } from '@tremor/react';
import { IconTrash } from '@tabler/icons-react';
import './Home.css';

const Home = () => {
  const { selectedStocks, removeStock } = useStock();

  const valueFormatter = (number) => {
    return '$ ' + new Intl.NumberFormat('us').format(number).toString();
  };

  return (
    <div className="home-container">
      <h1 className="home-title mb-8">Dashboard</h1>
      <div className="grid-container">
        {selectedStocks.slice(0, 9).map((stock, index) => (
          <CardContainer key={index} className="w-full max-w-md card-container">
            <CardBody className="bg-white dark:bg-gray-800 rounded-lg shadow-lg card-body">
              <div className="card-header">
                <IconTrash 
                  onClick={() => removeStock(stock.symbol)}
                  className="delete-icon"
                />
              </div>
              <CardItem className="w-full card-item">
                <h2 className="text-xl font-semibold">{stock.stockInfo.name}</h2>
                <p className="mt-2">{stock.stockInfo.sector}</p>
                <p className="mt-2">{stock.stockInfo.industry}</p>
                <div className="chart-container">
                  <AreaChart
                    className="area-chart"
                    data={stock.chartData}
                    index="date"
                    yAxisWidth={65}
                    categories={['close']}
                    colors={['indigo']}
                    valueFormatter={valueFormatter}
                    showAnimation={true}
                    animationDuration={900}
                  />
                </div>
              </CardItem>
            </CardBody>
          </CardContainer>
        ))}
      </div>
      <div className="dashboard-info">
        <p>
          Welcome to your StockVue dashboard! Our platform utilizes advanced machine learning models, including Long Short-Term Memory (LSTM) networks, to provide accurate stock price predictions. We gather data from trusted sources like Yahoo Finance and Twelve Data to ensure you have the most reliable information at your fingertips. Search for your favorite stocks and save them to your dashboard to track their performance over time. Your saved stocks will be displayed here, allowing you to easily monitor their trends and make informed decisions. You can then visit the Predictions page to forecast future stock prices and make more informed investment decisions.
        </p>
      </div>
    </div>
  );
};

export default Home;
