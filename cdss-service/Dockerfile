## Build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn -DskipTests package

## Run
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV TZ_UTC LANG=C.UTF-8
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]