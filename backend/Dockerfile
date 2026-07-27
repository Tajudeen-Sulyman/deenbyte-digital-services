FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --omit=dev && npx prisma generate

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p logs uploads/avatars
EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
