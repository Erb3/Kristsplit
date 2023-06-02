FROM node:16-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev

FROM gcr.io/distroless/nodejs:16
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY . .
CMD [ "app.js" ]
