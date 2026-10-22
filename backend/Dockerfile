# syntax=docker/dockerfile:1

FROM node:22-alpine AS frontend-build
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN --mount=type=cache,id=aitusa-crm-npm,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-21-alpine AS backend-build
WORKDIR /build/backend
COPY backend/pom.xml ./
RUN --mount=type=cache,id=aitusa-crm-m2,target=/root/.m2 \
    mvn dependency:go-offline -B
COPY backend/src ./src
COPY --from=frontend-build /build/frontend/dist ./src/main/resources/static/crm
RUN --mount=type=cache,id=aitusa-crm-m2,target=/root/.m2 \
    mvn clean package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
RUN addgroup -S aitusa && adduser -S aitusa -G aitusa
COPY --from=backend-build /build/backend/target/aitusa-crm.jar /app/aitusa-crm.jar
USER aitusa
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/aitusa-crm.jar"]
