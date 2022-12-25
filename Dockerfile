# Dockerfile

FROM node:16-alpine

RUN npm install

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "build"]