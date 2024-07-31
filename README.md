# Gogo Crawler

Gogo Crawler is a web crawling tool designed to crawl the web and store the data in a MongoDB database. 

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Setup](#setup)
- [Usage](#usage)
- [Credits](#credits)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed [Node.js](https://nodejs.org/en/download/) and [Bun](https://bun.sh/)
- You have a running instance of [MongoDB](https://www.mongodb.com/)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/DeveloperJosh/gogo-crawler.git
    cd gogo-crawler
    ```

2. Install the dependencies:

    ```bash
    bun install
    ```

## Setup

1. Create a `.env` file in the root of the project and add your MongoDB connection details:

    ```env
    MONGO_URL=your_mongo_url
    ```

2. Ensure your MongoDB instance is running and accessible.

## Usage

To start the Gogo Crawler, run the following command:

```bash
bun crawl
```
And that's it! The crawler will start crawling the web and storing the data in your MongoDB database.

## Credits

This project was inspired by the [anime-crawler](https://github.com/riimuru/anime-crawler) project by [riimuru](https://github.com/riimuru).
