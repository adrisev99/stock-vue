from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import numpy as np
import pandas as pd
import requests
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import LSTM, Dense
from keras.optimizers import Adam
from sklearn.metrics import mean_squared_error
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

TWELVE_DATA_API_KEY = os.getenv("TWELVE_DATA_API_KEY")

def create_dataset(data, time_step=1):
    X, Y = [], []
    for i in range(len(data) - time_step - 1):
        X.append(data[i:(i + time_step), 0])
        Y.append(data[i + time_step, 0])
    return np.array(X), np.array(Y)

def build_and_train_model(data, time_step=100, epochs=50):
    scaler = MinMaxScaler(feature_range=(0, 1))
    data_scaled = scaler.fit_transform(data)

    X, Y = create_dataset(data_scaled, time_step)

    # Split into train and test sets
    train_size = int(len(X) * 0.8)
    X_train, X_test = X[0:train_size], X[train_size:len(X)]
    Y_train, Y_test = Y[0:train_size], Y[train_size:len(Y)]

    # Reshape input to be [samples, time steps, features]
    X_train = X_train.reshape(X_train.shape[0], X_train.shape[1], 1)
    X_test = X_test.reshape(X_test.shape[0], X_test.shape[1], 1)

    # Build the LSTM model
    model = Sequential()
    model.add(LSTM(50, return_sequences=True, input_shape=(time_step, 1)))
    model.add(LSTM(50, return_sequences=False))
    model.add(Dense(1))
    model.compile(optimizer=Adam(learning_rate=0.001), loss='mean_squared_error')

    # Train the model
    history = model.fit(X_train, Y_train, epochs=epochs, batch_size=64, validation_data=(X_test, Y_test), verbose=1)

    # Make predictions
    train_predict = model.predict(X_train)
    test_predict = model.predict(X_test)

    # Inverse transform predictions and actual values
    train_predict = scaler.inverse_transform(train_predict)
    test_predict = scaler.inverse_transform(test_predict)
    Y_train = scaler.inverse_transform([Y_train])
    Y_test = scaler.inverse_transform([Y_test])

    # Calculate RMSE
    train_rmse = np.sqrt(mean_squared_error(Y_train[0], train_predict[:, 0]))
    test_rmse = np.sqrt(mean_squared_error(Y_test[0], test_predict[:, 0]))

    return model, scaler, history, train_predict, test_predict, train_rmse, test_rmse

@app.route('/historical/<symbol>', methods=['GET'])
def get_historical_data(symbol):
    try:
        stock = yf.Ticker(symbol)
        stock_info = stock.info
        stock_history = stock.history(period="max")
        stock_history.reset_index(inplace=True)

        # Filter out data with zero values and find the first non-zero close price date
        stock_filtered = stock_history[stock_history["Close"] > 0]
        if stock_filtered.empty:
            raise ValueError("No trading data available for this stock.")

        # Find the start date of actual trading data
        start_date = stock_filtered["Date"].min()
        stock_filtered = stock_history[stock_history["Date"] >= start_date].copy()

        data = {
            "name": stock_info.get("longName", ""),
            "sector": stock_info.get("sector", ""),
            "industry": stock_info.get("industry", ""),
            "history": stock_filtered[["Date", "Close"]].to_dict(orient="records")
        }
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@app.route('/intraday/<symbol>', methods=['GET'])
def get_intraday_data(symbol):
    try:
        url = f"https://api.twelvedata.com/time_series?symbol={symbol}&interval=1min&outputsize=390&apikey={TWELVE_DATA_API_KEY}"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        if 'values' not in data:
            raise ValueError("No intraday data available for this stock.")
        
        formatted_data = [
            {"Time": item["datetime"], "Price": float(item["close"])}
            for item in data["values"]
        ]
        
        return jsonify(formatted_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@app.route('/predict/<symbol>', methods=['GET'])
def predict_stock(symbol):
    try:
        stock = yf.Ticker(symbol)
        stock_info = stock.info
        print(f"Stock Info: {stock_info}")
        
        stock_history = stock.history(period="max")
        print(f"Stock History (raw): {stock_history.head()}")

        if stock_history.empty:
            raise ValueError("No trading data available for this stock.")

        stock_history.reset_index(inplace=True)

        # Filter out data with zero values and find the first non-zero close price date
        stock_filtered = stock_history[stock_history["Close"] > 0]
        if stock_filtered.empty:
            raise ValueError("No trading data available for this stock.")
        
        print(f"Filtered Stock History: {stock_filtered.head()}")

        # Find the start date of actual trading data
        start_date = stock_filtered["Date"].min()
        stock_filtered = stock_history[stock_history["Date"] >= start_date].copy()

        print(f"Stock History after filtering and sorting: {stock_filtered.head()}")

        stock_history_values = stock_filtered["Close"].values.reshape(-1, 1)
        print(f"Stock History Values: {stock_history_values[:5]}")

        if stock_history_values.size == 0:
            raise ValueError("No historical data found for this symbol.")

        model, scaler, history, train_predict, test_predict, train_rmse, test_rmse = build_and_train_model(stock_history_values)

        # Use the last `time_step` values for prediction
        time_step = 100
        if len(stock_history_values) < time_step:
            raise ValueError("Not enough data to perform prediction.")

        last_values = stock_history_values[-time_step:]
        last_values_scaled = scaler.transform(last_values)
        last_values_scaled = last_values_scaled.reshape(1, time_step, 1)

        # Predict future values
        future_steps = 50  # Number of future days to forecast
        future_predictions = []

        for _ in range(future_steps):
            future_pred = model.predict(last_values_scaled)
            future_predictions.append(future_pred[0, 0])
            last_values_scaled = np.append(last_values_scaled[:, 1:, :], np.expand_dims(future_pred, axis=0), axis=1)

        future_predictions = np.array(future_predictions).reshape(-1, 1)
        future_predictions = scaler.inverse_transform(future_predictions)

        future_dates = pd.date_range(start=stock_filtered["Date"].iloc[-1], periods=future_steps).tolist()
        predictions = [{"date": date.strftime("%Y-%m-%d"), "predicted_close": float(pred)} for date, pred in zip(future_dates, future_predictions)]
        
        # Extract loss and val_loss from the history
        loss = [{"epoch": i + 1, "loss": float(l)} for i, l in enumerate(history.history['loss'])]
        val_loss = [{"epoch": i + 1, "val_loss": float(l)} for i, l in enumerate(history.history['val_loss'])]

        return jsonify({
            "predictions": predictions,
            "loss": loss,
            "val_loss": val_loss,
            "train_rmse": train_rmse,
            "test_rmse": test_rmse,
            "original_data": stock_history_values.tolist(),
            "train_predict": train_predict.tolist(),
            "test_predict": test_predict.tolist()
        })
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 404

if __name__ == '__main__':
    app.run(debug=True)
