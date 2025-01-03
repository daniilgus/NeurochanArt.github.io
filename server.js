import express from 'express';
import path from 'path';
import dotenv from 'dotenv'; 
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'app.html')); 
});
// Middleware для отключения кеширования
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Массив для хранения всех изображений
let allImages = []; // [{ id: 'photo_id', url: 'image_url', author: 'username', active: true }]

// Обработка обновлений от Telegram
const handleUpdate = (update) => {
    if (update.channel_post && update.channel_post.photo) {
        // Получаем URL изображения
        const imageUrl = getImageUrl(update.channel_post.photo);
        const imageId = update.channel_post.photo[0].file_id; // Получаем ID изображения

        // Проверяем, существует ли изображение в массиве
        const existingImageIndex = allImages.findIndex(img => img.id === imageId);

        if (existingImageIndex === -1) {
            // Если изображения нет в массиве, добавляем его
            allImages.push({ id: imageId, url: imageUrl, author: update.channel_post.from.username, active: true });
        } else {
            // Если изображение уже есть, обновляем его состояние
            allImages[existingImageIndex].active = true; // Обновляем состояние на активное
        }
    }

    // Обработка событий удаления
    if (update.channel_post && update.channel_post.text && update.channel_post.text.includes("удалить")) {
        // Предположим, что текст сообщения содержит команду для удаления изображения
        const imageIdToDelete = extractImageIdFromText(update.channel_post.text); // Функция для извлечения ID изображения из текста

        const existingImageIndex = allImages.findIndex(img => img.id === imageIdToDelete);
        if (existingImageIndex !== -1) {
            // Устанавливаем состояние изображения как неактивное
            allImages[existingImageIndex].active = false;
        }
    }
};

// Пример функции для получения URL изображения
const getImageUrl = (photos) => {
    return photos[photos.length - 1].file_id; // Или другой способ получения URL
};

// Пример функции для извлечения ID изображения из текста
const extractImageIdFromText = (text) => {
    // Логика для извлечения ID изображения из текста
    // Например, если текст выглядит так: "удалить photo_id"
    return text.split(" ")[1]; // Предполагаем, что ID идет после слова "удалить"
};

// Эндпоинт для получения всех активных изображений
app.get('/getImages', (req, res) => {
    const activeImages = allImages.filter(img => img.active); // Фильтруем только активные изображения
    res.json(activeImages);
});

// Обработчик для корневого маршрута
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Отправляем HTML-файл
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    // Установите вебхук для получения обновлений от Telegram
});
