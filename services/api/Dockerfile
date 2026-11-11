# API (NestJS). Construcción en etapas: la imagen final solo lleva dependencias de producción.
# Node 26 ya no trae corepack: pnpm se instala con npm (misma versión que `packageManager`).
FROM node:26-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@12.18.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN pnpm build

FROM node:26-alpine AS prod-deps
WORKDIR /app
RUN npm install -g pnpm@12.18.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM node:26-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 10010
# Migraciones y comandos de servidor, sin pnpm:
#   node node_modules/typeorm/cli.js migration:run -d dist/shared/infrastructure/database/data-source.js
#   node dist/identity/infrastructure/cli/seed-manager.js
#   docker exec -it <contenedor> node dist/identity/infrastructure/cli/assign-roles.js
CMD ["node", "dist/main.js"]
