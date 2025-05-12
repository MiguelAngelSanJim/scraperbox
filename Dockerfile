FROM mcr.microsoft.com/playwright:v1.52.0-focal

# Crear y usar directorio de trabajo
WORKDIR /app

# Copiar archivos
COPY . .

# Instalar dependencias del proyecto
RUN npm install

# Exponer el puerto del servidor
EXPOSE 3000

# Comando para arrancar la API
CMD ["node", "api.js"]
