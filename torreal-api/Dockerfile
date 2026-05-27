# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache wget \
    && addgroup -S torreal && adduser -S torreal -G torreal \
    && mkdir -p /app/uploads \
    && chown -R torreal:torreal /app
COPY --from=build /build/target/torreal-api-*.jar /app/app.jar
USER torreal
ENV TORREAL_UPLOADS_DIR=/app/uploads
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=5 \
  CMD wget -qO- http://127.0.0.1:8080/api/health >/dev/null || exit 1
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
