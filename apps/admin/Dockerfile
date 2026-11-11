# Admin (Astro, SSR con adaptador Node). La imagen final solo lleva dependencias de producción.
# Node 26 ya no trae corepack: pnpm se instala con npm (misma versión que `packageManager`).
FROM node:26-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@12.18.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:26-alpine AS prod-deps
WORKDIR /app
RUN npm install -g pnpm@12.18.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM node:26-alpine AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=10011
WORKDIR /app
COPY package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 10011
CMD ["node", "dist/server/entry.mjs"]
