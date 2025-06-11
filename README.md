# TimeTraveller (team34)

## By Marc Luzuriaga, Pranav Kesani, Rakil Kim

**TimeTraveller** is a web-based application that applies time series forecasting methods to live stock data, enabling users to visualize and predict future price trends across various intervals. The system integrates secure user authentication, advanced forecasting algorithms, and a responsive frontend interface designed for real-time interaction and accessibility.

---

## Project Structure

This project consists of three core modules:

### 1. Authentication Module
The Authentication Module handles user registration, login, session management, and secure access control.

- **Technologies:** Express.js, MongoDB, JWT (JSON Web Tokens)
- **Features:**
  - User sign-up and login with hashed passwords
  - Token-based session validation
  - Retrieve and Post User Data to MongoDB

### 2. Forecasting Module
The Forecasting Module handles the creation of forecasts.

- **Technologies:** Python, FastAPI, Redis, statsmodels, and Prophet
- **Features:**
  - Supports forecasting methods such as ARIMA, ETS, Prophet, MAPA
  - Combines historical data preprocessing with model selection
  - Offers multi-step predictions with trend, seasonality, and residual modeling
  - Exposes a REST API for the frontend to consume forecast results

### 3. Frontend Module
The Frontend Module provides an interactive user interface for managing time series inputs and visualizing forecast results.

- **Technologies:** React, Vite, Tailwind CSS, uPlot, vite-plugin-pwa
- **Features:**
  - Dynamic plot rendering via uPlot with HTML5 `<canvas>`
  - Form controls for selecting forecast method, interval, and step count
  - Responsive, mobile-friendly UI
  - PWA support for offline usage and installable app behavior


## Getting Started

To get started with **TimeTraveller**, refer to the `README.md` files located within each of the main modules:

- [`auth/README.md`](auth/README.md) – Setup instructions for the **Authentication Module**
- [`forecast_module/README.md`](forecast_module/README.md) – Setup and API usage for the **Forecasting Module**
- [`frontend/README.md`](frontend/README.md) – Development and deployment instructions for the **Frontend Module**
- [`frontend/src/rust/README.md`](frontend/src/rust/README.md) - Setup instructions for **Web Assembly Module**

Each module is independently deployable and designed to work together as part of the full-stack application.