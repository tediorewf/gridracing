FROM node:alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
