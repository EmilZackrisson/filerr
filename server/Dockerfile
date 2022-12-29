FROM node:16-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# RUN npm run build && npm prune --production
ENV PORT 8000
EXPOSE 8000
CMD ["npm", "run", "start"]