<h1 align="center">
  <br />
  📁
  <br />
  CabinetJS
  <sup>
    <br />
    <br />
  </sup>    
</h1>

<div align="center">
    <a href="https://www.npmjs.com/package/@cabinetjs/server">
        <img alt="npm (tag)" src="https://img.shields.io/npm/v/@cabinetjs/server?style=flat-square">
    </a>
    <a href="https://github.com/cabinetjs/server/blob/main/LICENSE">
        <img src="https://img.shields.io/github/license/cabinetjs/server.svg?style=flat-square" alt="MIT License" />
    </a>
    <br />
    <sup>archive <i>everything</i> on the web <i>anywhere</i></sup>
    <br />
    <br />
</div>

## Introduction

CabinetJS is a cli application for archiving web contents from various sources.

## Installation

```bash
npm install -g @cabinetjs/server
```

## Usage

```bash
$ cabinet -h

Usage: cabinet [options]

Options:
  -c, --config <path>  Path to config file (default: "./cabinet.config.json")
  -h, --help           display help for command
```

## Configuration

We use a JSON file to configure CabinetJS. The default path is `./cabinet.config.json`. you can change it with `-c` or `--config` CLI option.

```json5
{
    "dataSources": [
        // data sources ...
    ],
    "crawlInterval": 160000,
    "storage": {
        // storage options ...
    }
}

```
