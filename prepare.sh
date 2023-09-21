#!/bin/bash

# Go to client, install dependencies, and run prepare
cd client
# yarn install
yarn prepare

# Go to server, install dependencies, and run prepare
cd ../server
# yarn install
yarn prepare
