FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY MaliksTech.PM.Api.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app .

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

# Render injects $PORT at runtime; bind Kestrel to it.
ENTRYPOINT ["/bin/sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet MaliksTech.PM.Api.dll"]
