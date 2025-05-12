# Usa imagen oficial con navegadores Playwright preinstalados
FROM mcr.microsoft.com/playwright:v1.52.0-focal

# Crea y usa el directorio de trabajo
WORKDIR /app

# Copia los archivos del proyecto al contenedor
COPY . .

# Instala las dependencias
RUN npm install

# Expone el puerto que usa Express
EXPOSE 3000

# Comando para lanzar la API
CMD ["node", "api.js"]
