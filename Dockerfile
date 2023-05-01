# Используем официальный образ Node.js с версией 16.x.x
FROM node:16-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json в директорию /app
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем все файлы в директорию /app
COPY . .

ENV PORT=3000

EXPOSE $PORT

# Определяем команду для запуска приложения
CMD ["npm", "start"]
