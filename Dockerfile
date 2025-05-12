FROM mcr.microsoft.com/playwright:v1.42.1-focal

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["node", "api.js"]
