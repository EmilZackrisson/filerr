FROM node:16-alpine
WORKDIR /app
COPY package.json package-lock.json ./
# COPY .env ./
ARG PUBLIC_URL
ENV PUBLIC_URL ${PUBLIC_URL}
ARG PUBLIC_APPWRITE_ENDPOINT
ENV PUBLIC_APPWRITE_ENDPOINT ${PUBLIC_APPWRITE_ENDPOINT}
ARG PUBLIC_APPWRITE_PROJECT
ENV PUBLIC_APPWRITE_PROJECT ${PUBLIC_APPWRITE_PROJECT}
ARG PUBLIC_APPWRITE_DATABASE_ID
ENV PUBLIC_APPWRITE_DATABASE_ID ${PUBLIC_APPWRITE_DATABASE_ID}
ARG PUBLIC_APPWRITE_COLLECTION_ID
ENV PUBLIC_APPWRITE_COLLECTION_ID ${PUBLIC_APPWRITE_COLLECTION_ID}
ARG PUBLIC_APPWRITE_TEAM_ADMIN_ID
ENV PUBLIC_APPWRITE_TEAM_ADMIN_ID ${PUBLIC_APPWRITE_TEAM_ADMIN_ID}
ARG PUBLIC_URL
ENV PUBLIC_URL ${PUBLIC_URL}
ARG PRIVATE_APPWRITE_API_KEY
ENV PRIVATE_APPWRITE_API_KEY ${PRIVATE_APPWRITE_API_KEY}
RUN npm install
COPY . .
RUN npm run check
RUN npm run build && npm prune --production
ENV PORT 5050
EXPOSE 5050
CMD ["node", "build"]