FROM node:20.14.0-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm build

EXPOSE 5004

CMD ["pnpm", "start"]
