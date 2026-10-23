#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"

echo "Building frontend..."
(cd frontend && npm run build)

echo "Copying frontend build into backend static resources..."
rm -rf backend/src/main/resources/static
mkdir -p backend/src/main/resources/static
cp -r frontend/dist/* backend/src/main/resources/static/

echo "Building backend JAR..."
(cd backend && mvn -q clean package -DskipTests)

echo "Built: backend/target/health-tracker-0.1.0.jar"
