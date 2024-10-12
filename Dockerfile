FROM --platform=linux/amd64 node:20-alpine

WORKDIR /usr/src/app
COPY . .
RUN npm install --production --silent
RUN npx prisma generate
COPY .env .
COPY ecosystem.config.js .
RUN npm i -g pm2

EXPOSE 8080
CMD ["pm2-runtime", "ecosystem.config.js", "--env", "production", "--no-autorestart"]