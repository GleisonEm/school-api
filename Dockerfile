# Use a imagem base do Node.js
FROM node:18-slim

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie o package.json e o package-lock.json (ou yarn.lock)
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie os arquivos do projeto para o diretório de trabalho
COPY . .

# Exponha a porta que a API usará
EXPOSE 3022

# Comando para iniciar a aplicação
CMD ["npm", "run", "start"]
