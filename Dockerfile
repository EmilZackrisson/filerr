FROM node:16-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
RUN touch .env
RUN echo "PUBLIC_URL=https://your-public-url" >> .env
COPY . .
RUN npm run build && npm prune --production
ENV PORT 5050
EXPOSE 5050
# CMD ["node", "build"]
CMD /start.sh