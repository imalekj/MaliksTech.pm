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
# Constrained containers often hit the inotify instance limit; the config
# system's FileSystemWatcher-based reload-on-change isn't needed at runtime.
ENV DOTNET_hostBuilder__reloadConfigOnChange=false
EXPOSE 8080

# Render injects $PORT at runtime; bind Kestrel to it.
ENTRYPOINT ["/bin/sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet MaliksTech.PM.Api.dll"]
