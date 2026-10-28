# Health Tracker - Version 1 (v1)
# Roll No: 24MIS0130
FROM node:20-alpine

LABEL maintainer="24MIS0130"
LABEL version="v1"
LABEL description="Health Tracker v1 - Enter Data (Input health values)"

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production
ENV APP_VERSION=v1

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
