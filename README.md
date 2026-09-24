# Product Admin Dashboard

A responsive Product Admin Dashboard built using Next.js, React, Tailwind CSS and Axios with the DummyJSON API.

## Tech Stack

* Next.js
* React
* Tailwind CSS
* Axios
* DummyJSON API
* JavaScript
* LocalStorage

## Features

### Authentication

* Login using DummyJSON authentication API
* Username: `emilys`
* Password: `emilyspass`
* JWT access token stored in LocalStorage
* Protected product pages
* Logout functionality
* Invalid login error handling
* Prevents multiple login requests

### Product Management

* View products
* Product details page
* Add new product
* Edit product
* Delete product with confirmation
* Product image upload and preview
* Form validation
* Changes from add/edit/delete are maintained using LocalStorage because DummyJSON provides simulated mutation responses

### Search, Filter and Sort

* Product search with debounce
* Category filter
* Sort by:

  * Price
  * Rating
  * Title
* Search, category, sort and pagination state are reflected in the URL
* Category filter has priority over search because DummyJSON does not support combining search and category filtering in one API request

### Pagination

* Previous / Next navigation
* Page size options:

  * 10
  * 20
  * 50
* Shows the current product range and total count

### Responsive Design

* Desktop: Product table
* Mobile: Product cards
* Responsive forms and product details pages

### Error Handling

* Loading states
* Empty states
* API error messages
* Retry handling
* Invalid product ID handling
* Invalid URL query values are handled safely

### Request Handling

* Shared Axios instance
* Authorization token automatically added to requests
* Centralized 401 handling
* Prevents repeated login/save requests
* Request ID protection prevents stale search results from replacing newer results

## API

DummyJSON:

https://dummyjson.com

Main endpoints used:

* `/auth/login`
* `/products`
* `/products/search`
* `/products/categories`
* `/products/category`
* `/products/:id`
* `/products/add`
* `/products/:id` PUT
* `/products/:id` DELETE

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Login Credentials

```text
Username: emilys
Password: emilyspass
```

## Important Implementation Choices

### Search and Category Filter

DummyJSON does not support searching and category filtering together.

The application gives priority to the category filter. When a category is selected, the search value is cleared so that only one API filtering mode is active.

### Local Product Changes

DummyJSON simulates POST, PUT and DELETE operations and does not permanently modify the server data.

Therefore, added and edited products and deleted products are maintained in LocalStorage so that the changes remain visible during the application session.

### Stale Search Results

Search requests use request tracking so that an older, slower response cannot overwrite a newer search result.

This is especially important when testing with delayed API responses.

## Problem Faced and Fixed

One issue was handling fast product searches.

When users typed quickly, an older API request could finish after a newer request and replace the latest results.

This was fixed by tracking each request and accepting the response only if it belongs to the latest request.

## AI Assistance

AI tools were used during development to help with code structure, debugging, styling ideas, API handling and implementation guidance.

All implemented features were tested and reviewed manually.
