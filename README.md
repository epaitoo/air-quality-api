# Air Quality REST API

## Description
Node.js REST API for fetching air quality information for a given geographical location.

It uses [IQ AIR API](https://api-docs.iqair.com/) to retrieve air quality data and stores it in a postgres Database.


## Features
- The API allows users to query air quality data by specifying longitude and latitude coordinates
- Cron Job to retrieve the most polluted air period in Paris based on historical data every minute and save to Database
- [Prisma ORM](https://www.prisma.io/) with Postgres
- Docker and Docker Compose

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development.

### Prerequisites
Please ensure you have met the following requirements:

- Node.js and npm installed on your machine.
- An IQAIR API key. You can obtain one by registering on the [IQAIR dashboard](https://api-docs.iqair.com/).
- Postgres on your machine or you can install [Docker](https://docs.docker.com/get-docker/) and Docker Compose (for running the postgres database in a container)


### Installation
- Click on the 'Clone or download' button and select 'Download Zip.'
- Move to the project directory:
```bash
$ cd air-quality-api
```
- Install dependencies:
```bash
$ npm install
```
- Create a `.env` and `.env.test` files in the project root directory. Use the configuration in `.env.example` and `.env.test.example` to configure the environment variables for the `.env` and `.env.test` respectively.
  

### Running the Application
- Start the PostgreSQL database using Docker Compose, If you have Docker installed on your machine:
```bash
$ docker-compose up -d
```
Or if you don't have docker on your machine, you can start the postgres DB on your local machine
- Migrate the tables to the DB:
```bash
$ npm run prisma:dev:deploy
```
Start the application:
```bash
$ npm run dev
```

## Tests
Docker compose file in the root directly has a instance of a TestDB for running test in a testing environment.

```bash
# unit tests
$ npm run unit:test

# integration tests
$ npm run integration:test

# All test
$ npm run test

```

## API USAGE

The API supports the following endpoints:

GET `/api/get-air-quality/:longitude/:latitude`

Retrieves air quality information for a specific location based on longitude and latitude coordinates.

Parameters:

- longitude: The longitude coordinate of the location.
- latitude: The latitude coordinate of the location.

Example Request:

```http
GET /api/get-air-quality/2.352222/48.856613
```

GET `/api/get-air-quality/paris-most-polluted-time`

Retrieves the date and time when the air quality in Paris was the most polluted based on historical data.

Example Request:

```http
GET /api/get-air-quality/paris-most-polluted-time
```