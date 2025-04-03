#!/bin/bash

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Start the development server
npm run dev 