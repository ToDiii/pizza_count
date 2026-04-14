#!/bin/sh
set -e

echo "🍕 Running database migrations..."
npx prisma migrate deploy

echo "🍕 Starting Pizza Count..."
exec node server.js
