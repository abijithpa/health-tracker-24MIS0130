# Health Tracker - Version 3 (v3)
# Roll No: 24MIS0130
FROM node:20-alpine

LABEL maintainer="24MIS0130"
LABEL version="v3"
LABEL description="Health Tracker v3 - Chart (Show simple graph)"

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production
ENV APP_VERSION=v3

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
