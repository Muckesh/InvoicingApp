# Invoice Generator Application

## Overview

A full-stack invoice generator application with a separated frontend (HTML/CSS/JavaScript) and backend (ASP.NET Core Web API with SQL database). This application allows users to:

- Manage customers
- Manage products
- Create and manage invoices
- View and print invoice previews

## Project Structure

```
InvoicingApp/
├── Frontend/                  # Client-side application
│   ├── index.html             # Main HTML file
│   ├── styles/                # CSS styles
│   │   └── styles.css         # Main stylesheet
│   └── scripts/               # JavaScript files
│       └── script.js          # Main application logic
└── Backend/                   # Server-side application
    └── InvoiceApp/            # ASP.NET Core Web API
        ├── Controllers/       # API controllers
        ├── Models/           # Data models
        ├── Program.cs        # Application entry point
        ├── appsettings.json  # Configuration
        └── (other ASP.NET Core files)
```

## Features

- **Customer Management**
  - Add, view, and delete customers
  - Customer details (name, email, phone, address)

- **Product Management**
  - Add, view, and delete products
  - Product details (name, description, price)

- **Invoice Management**
  - Create invoices by selecting customers and adding products
  - Set due dates and quantities
  - View invoice preview with calculated totals
  - Print invoices
  - View and delete existing invoices

## Development Notes

- **CORS**: The backend is configured to accept requests from `http://localhost:5000` by default
- **Database**: The application uses Entity Framework Core with SQL Server
- **Frontend**: Pure JavaScript with no frameworks - easy to modify

