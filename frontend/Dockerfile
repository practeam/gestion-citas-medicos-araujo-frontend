# ==========================================
# ETAPA 1: Construcción del frontend
# ==========================================
FROM node:24-alpine AS build

WORKDIR /app

# Dependencias
COPY package*.json ./
RUN npm ci

# Código fuente y configuración de producción
COPY . .

# Compilar React con Vite
RUN npm run build


# ==========================================
# ETAPA 2: Servidor de producción
# ==========================================
FROM caddy:2-alpine

COPY --from=build /app/dist /usr/share/caddy

EXPOSE 80

CMD ["caddy", "file-server", "--root", "/usr/share/caddy", "--listen", ":80"]