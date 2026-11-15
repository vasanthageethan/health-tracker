FROM node:22-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn -q dependency:go-offline
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist/ ./src/main/resources/static/
RUN mvn -q clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/backend/target/health-tracker-0.1.0.jar app.jar
EXPOSE 8080
ENV SERVER_ADDRESS=0.0.0.0
ENV DATA_DIR=/data
VOLUME /data
ENTRYPOINT ["java", "-jar", "app.jar"]
