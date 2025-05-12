FROM mcr.microsoft.com/playwright:focal

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos
COPY . .

# Instalar dependencias de Node.js
RUN npm install

# Exponer puerto
EXPOSE 3000

# Iniciar el servidor
CMD ["node", "api.js"]
