# User-Service

## Index

- [Project Overview](#overview-project)
- [Basic Setup](#prerequisite)
- [Environment](#environment)
- [Build on Server](#scripts)
- [Run Locally](#locally-in-your-project)
- [Folder Structure](#folder-structure)
- [Localhost Swagger URL](#localhost-swagger-url)
- [Base Project Architecture](#base-project-architecture)
  - [Controllers](#controllers)
  - [Models](#models)
  - [Services](#services)
  - [Utils](#utils)

## Overview-Project

Yooshie was created to help busy individuals manage their personal, work, and health commitments effectively. By providing personalized reminders, goal tracking, and other assistant-driven features, Yooshie simplifies task management and keeps users on track with their daily objectives.

The **User Service** is responsible for managing all user-related features such as user onboarding, user listing, and managing user rewards. This service ensures users have a seamless experience from onboarding through reward management, enabling easy access to account-related functionalities.

## Prerequisite

- **_Redis Server_** - Ensure Redis Server is up and running in your system.
- **_MongoDB_** - Ensure MongoDB server >=6.x is up and running.
- **_Node.js_** - NodeJS >= 20.X should be installed and running.

- **_Install Dependencies_** - Run `npm install` to install all dependencies.
  ```
  npm install
  ```

## Environment

- **_Setup Environment_** - Create a file named `.env.local` in your root folder with the required environment variables.

## Scripts

    "prestart": "tsc",
    "local": "tsc && NODE_ENV=local node ./build/server.js",
    "watch": "tsc --watch",
    "development": "tsc && NODE_ENV=development node ./build/server.js",
    "nodemon": "NODE_ENV=local nodemon --exec ts-node -- server.ts",
    "sc": "node_modules/sonar-scanner/bin/sonar-scanner"

## Folder Structure

```
Folder structure:-
 src
    ├── config
    ├── interfaces
    ├── json
    ├── lib
    │   └── redis
    ├── modules
    │   ├── baseDao
    │   ├── loginHistory
    │   │   └── v1
    │   └── user
    │   |   └── v1
    |   └── reward
    │       └── v1
    ├── plugins
    ├── routes
    ├── uploads
    ├── utils
    └── views
```

## locally-in-your-project

```
npm run local
```

# localhost swagger URL

- http://localhost:3003/user/documentation

### Basic Setup End

## Base Project Architechture

This project is configured according to component based structure.

# Library

Contains all external services used throughout the application.

# Modules

This directory contains all different modules used in our application for developing Controllers,Routes,Dao & Models.

# Controllers

Define business logic across the application.

# DAO

Defines the data access layer throughout the application.

# Models

Define the logical structure of the database.

# Routes

Contain all API endpoints of the application.

# Utils

Include utilities and helper classes used across the application.
