FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080

# Set environment variables for database connection
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://dpg-d07363k9c44c739l7iu0-a/st_myko
ENV SPRING_DATASOURCE_USERNAME=st_myko_user
ENV SPRING_DATASOURCE_PASSWORD=QmRzJ2T9ugSGnEqy9MZ1CjHgw9YFB3EG
ENV SPRING_JPA_HIBERNATE_DDL_AUTO=update
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-jar", "app.jar"] 