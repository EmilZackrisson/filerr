FROM node:16-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY .env ./
RUN npm install
COPY . .
RUN npm run check
RUN npm run build && npm prune --production
ENV PORT 5050
EXPOSE 5050
CMD ["node", "build"]