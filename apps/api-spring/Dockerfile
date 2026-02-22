FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY apps/api-spring/ ./
RUN chmod +x mvnw && ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

ENV PORT=8081
EXPOSE 8081

COPY --from=build /workspace/target/api-spring-0.0.1-SNAPSHOT.jar /app/app.jar

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar /app/app.jar"]
