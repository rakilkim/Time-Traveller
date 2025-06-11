# Authentication Module

## Running

At the root of the authenticaiton folder, run
```
node app.js
```

## Installing Dependencies

In order to install the associated dependencies for this module, run the following:

```
npm install
```

## Accessing the API

**Register a New User**
```
POST /api/register
```

Request Body:

```
{
  "username": "your_username",
  "email": "your_email@example.com",
  "password": "your_password"
}
```

Response:

- 201 Created – user registered successfully
- 400 Bad Request – email already exists
- 500 Internal Server Error – unexpected error

**Login and Get JWT Token**

```
POST /api/login
```

Request Body:

```
{
  "email": "your_email@example.com",
  "password": "your_password"
}
```

Response:

- 200 OK – returns { "token": "<jwt>" }

- 401 Unauthorized – invalid credentials

- 500 Internal Server Error – unexpected error

**Get Current User Info**

```
GET /api/user
```
Headers:

```
Authorization: Bearer <token>
```

Response:

```
{
  "username": "your_username",
  "email": "your_email@example.com",
  "tickers": ["AAPL", "MSFT"]
}
```

- 200 OK – returns user data
- 401 Unauthorized – invalid or missing token
- 404 Not Found – user not found

**Ticker Management Endpoints**

Add a Ticker to User Watchlist

```
POST /api/addticker
```

Headers:
```
Authorization: Bearer <token>
```

Request Body:
```
{
  "email": "your_email@example.com",
  "ticker": "TSLA"
}
```

Response:

- 201 Created – ticker added successfully
- 400 Bad Request – email not found or already has ticker
- 500 Internal Server Error – unexpected error

**Remove a Ticker form User Watchlist**

```
DELETE /api/removeticker
```

Headers:
```
Authorization: Bearer <token>
```

Request Body:

```
{
  "ticker": "TSLA"
}
```

Response:

- 201 Created – ticker removed successfully
- 400 Bad Request – ticker not found in user list
- 500 Internal Server Error – unexpected error