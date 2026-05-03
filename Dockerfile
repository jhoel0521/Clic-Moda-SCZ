FROM node:20-alpine AS builder
WORKDIR /app

# Instala dependencias de sistema necesarias para compilación nativa
RUN apk add --no-cache python3 make g++ libc6-compat

# Copia ficheros de lock/package y instala todas las dependencias
COPY package*.json ./
RUN npm ci

# Copia el resto del código y construye la app
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Copiamos solo lo necesario para ejecutar en producción
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/data ./data

EXPOSE 3000

CMD ["npm", "start"]
