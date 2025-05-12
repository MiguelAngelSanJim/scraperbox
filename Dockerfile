FROM node:18

# Crear y usar directorio de trabajo
WORKDIR /app

# Copiar archivos
COPY . .

# Instalar dependencias
RUN npm install && npx playwright install --with-deps

# Exponer el puerto de Express
EXPOSE 3000

# Comando para iniciar la API
CMD ["node", "api.js"]
