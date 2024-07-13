import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart } from '@tremor/react';
import { IconTrash } from '@tabler/icons-react';
import './StockPredictions.css';
import { ButtonsCard } from '../ui/tailwindcss-buttons';

function StockPredictions() {
  const [stockSymbol, setStockSymbol] = useState('AAPL');
  const [predictions, setPredictions] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [trainPredict, setTrainPredict] = useState([]);
  const [testPredict, setTestPredict] = useState([]);
  const [loss, setLoss] = useState([]);
  const [valLoss, setValLoss] = useState([]);
  const [trainRmse, setTrainRmse] = useState(null);
  const [testRmse, setTestRmse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedPredictions, setSavedPredictions] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedPredictions')) || [];
    setSavedPredictions(saved);
  }, []);

  const fetchPredictions = (symbol) => {
    setLoading(true);
    axios.get(`http://127.0.0.1:5000/predict/${symbol}`)
      .then(response => {
        setPredictions(response.data.predictions ?? []);
        setOriginalData(response.data.original_data ?? []);
        setTrainPredict(response.data.train_predict ?? []);
        setTestPredict(response.data.test_predict ?? []);
        setLoss(response.data.loss ?? []);
        setValLoss(response.data.val_loss ?? []);
        setTrainRmse(response.data.train_rmse ?? null);
        setTestRmse(response.data.test_rmse ?? null);
        setError('');
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching prediction data:', error);
        setError('Error fetching prediction data.');
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    setStockSymbol(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    fetchPredictions(stockSymbol);
  };

  const savePrediction = () => {
    const saved = [...savedPredictions, {
      symbol: stockSymbol,
      predictions,
      originalData,
      trainPredict,
      testPredict,
      loss,
      valLoss,
      trainRmse,
      testRmse
    }];
    setSavedPredictions(saved);
    localStorage.setItem('savedPredictions', JSON.stringify(saved));
  };

  const deletePrediction = (index) => {
    const updatedSavedPredictions = savedPredictions.filter((_, i) => i !== index);
    setSavedPredictions(updatedSavedPredictions);
    localStorage.setItem('savedPredictions', JSON.stringify(updatedSavedPredictions));
  };

  const valueFormatter = (number) => `$ ${new Intl.NumberFormat('us').format(number).toString()}`;

  const combinedData = (originalData, trainPredict, testPredict, predictions) => {
    if (!originalData || !trainPredict || !testPredict || !predictions) {
      return [];
    }

    const combined = [];
    const timeStep = 100;  // This should match the time_step value used in the backend

    originalData.forEach((value, index) => {
      combined.push({
        date: index,
        original: value?.[0] ?? null,
        train_predict: index >= timeStep && index < trainPredict.length + timeStep ? trainPredict[index - timeStep]?.[0] ?? null : null,
        test_predict: index >= trainPredict.length + timeStep && index < trainPredict.length + timeStep + testPredict.length ? testPredict[index - trainPredict.length - timeStep]?.[0] ?? null : null,
        future_predict: null,
      });
    });

    predictions.forEach((pred, index) => {
      combined.push({
        date: originalData.length + index,
        original: null,
        train_predict: null,
        test_predict: null,
        future_predict: pred?.predicted_close ?? null,
      });
    });

    return combined;
  };

  const lossData = (loss, valLoss) => {
    if (!loss || !valLoss) {
      return [];
    }

    return loss.map((l, index) => ({
      epoch: l?.epoch ?? null,
      loss: l?.loss ?? null,
      val_loss: valLoss[index]?.val_loss ?? null,
    })).filter(item => item.epoch !== null); // Filter out any entries with null epochs
  };

  return (
    <div className="stockpredictions-container">
      <form onSubmit={handleFormSubmit} className="stockpredictions-form">
        <input
          type="text"
          value={stockSymbol}
          onChange={handleInputChange}
          placeholder="Enter stock symbol"
          className="stockpredictions-input bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600"
        />
        <ButtonsCard type="submit" className="stockpredictions-button">
          Fetch Predictions
        </ButtonsCard>
      </form>
      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {predictions.length > 0 && (
        <div className="stockpredictions-charts">
          <h3 className="text-lg font-medium mb-4">{stockSymbol.toUpperCase()} Predictions</h3>
          <LineChart
            className="mt-4 h-72 mb-8 w-full"
            data={combinedData(originalData, trainPredict, testPredict, predictions)}
            index="date"
            yAxisWidth={65}
            categories={['original', 'train_predict', 'test_predict', 'future_predict']}
            colors={['blue', 'green', 'orange', 'red']}
            valueFormatter={valueFormatter}
            showAnimation={true}
            animationDuration={900}
          />
          <h3 className="text-lg font-medium mb-4">Training and Validation Loss</h3>
          <LineChart
            className="mt-4 h-72 mb-8 w-full"
            data={lossData(loss, valLoss)}
            index="epoch"
            yAxisWidth={65}
            categories={['loss', 'val_loss']}
            colors={['blue', 'orange']}
            valueFormatter={valueFormatter}
            showAnimation={true}
            animationDuration={900}
          />
          <div className="additional-info mt-8">
            <p>Train RMSE: {trainRmse}</p>
            <p>Test RMSE: {testRmse}</p>
          </div>
          <button onClick={savePrediction} className="stockpredictions-save-button">
            Save Prediction
          </button>
        </div>
      )}
      <div className="saved-predictions mt-8">
        <h3 className="text-lg font-medium mb-4">Saved Predictions</h3>
        {savedPredictions.map((saved, index) => (
          <details key={index} className="saved-prediction-details bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600">
            <summary>
              {saved.symbol}
              <IconTrash 
                onClick={() => deletePrediction(index)}
                className="delete-icon"
              />
            </summary>
            <div className="stockpredictions-charts">
              <LineChart
                className="mt-4 h-72 mb-8 w-full"
                data={combinedData(saved.originalData, saved.trainPredict, saved.testPredict, saved.predictions)}
                index="date"
                yAxisWidth={65}
                categories={['original', 'train_predict', 'test_predict', 'future_predict']}
                colors={['blue', 'green', 'orange', 'red']}
                valueFormatter={valueFormatter}
                showAnimation={true}
                animationDuration={900}
              />
              <h3 className="text-lg font-medium mb-4">Training and Validation Loss</h3>
              <LineChart
                className="mt-4 h-72 mb-8 w-full"
                data={lossData(saved.loss, saved.valLoss)}
                index="epoch"
                yAxisWidth={65}
                categories={['loss', 'val_loss']}
                colors={['blue', 'orange']}
                valueFormatter={valueFormatter}
                showAnimation={true}
                animationDuration={900}
              />
              <div className="additional-info mt-8">
                <p>Train RMSE: {saved.trainRmse}</p>
                <p>Test RMSE: {saved.testRmse}</p>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export default StockPredictions;



