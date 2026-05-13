FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app
ENV NODE_ENV=production

FROM base AS build-deps

ENV NODE_ENV=development

COPY package*.json ./
COPY .npmrc ./
COPY prisma ./prisma/
RUN npm ci

FROM build-deps AS builder

ENV NODE_ENV=development
COPY . .
RUN npm run build

FROM base AS prod-deps

COPY package*.json ./
COPY .npmrc ./
COPY prisma ./prisma/
RUN npm ci --omit=dev

FROM base AS runner

ENV PORT=3000

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/.npmrc ./
COPY --from=builder --chown=node:node /app/prisma ./prisma

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api" >/dev/null || exit 1

CMD ["npm", "run", "start:docker"]
