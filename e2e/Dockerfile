FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install
RUN npx playwright install chromium --with-deps

COPY . .

CMD ["tail", "-f", "/dev/null"]
