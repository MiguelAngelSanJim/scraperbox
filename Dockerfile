FROM mcr.microsoft.com/playwright:v1.42.1-focal

WORKDIR /app

COPY . .

RUN npm install \
  && npx playwright install --with-deps

EXPOSE 3000

CMD ["node", "api.js"]
