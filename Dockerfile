FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install
RUN npm run tsc

FROM node:20-alpine

WORKDIR /MFT

COPY --from=builder /app/build .

COPY --from=builder /app/levels.json .

COPY --from=builder /app/public .

COPY --from=builder /app/packs.json .

COPY --from=builder /app/package.json .

COPY --from=builder /app/package-lock.json .

ENV NODE_ENV production

EXPOSE 3000

RUN npm install --omit=dev

CMD ["node", "index.js"]