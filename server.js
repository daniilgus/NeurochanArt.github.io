import express from 'express';
import path from 'path';
import dotenv from 'dotenv'; 
import cors from 'cors';
import fetch from 'node-fetch';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public')); 

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'app.html')); 
});

// Хранение изображений в памяти
let currentImages = [];

// Удаление существующего вебхука
async function deleteWebhook() {
    const url = `https://api.telegram.org/bot${process.env.TOKEN}/deleteWebhook`;
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Ошибка удаления вебхука: ${response.status}`);
    } else {
        console.log("Вебхук успешно удален!");
    }
}

// Получение информации о вебхуке
async function getWebhookInfo() {
    const url = `https://api.telegram.org/bot${process.env.TOKEN}/getWebhookInfo`;
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Ошибка получения информации о вебхуке: ${response.status}`);
        return null;
    }
    const data = await response.json();
    return data.result;
}

// Установка вебхука
async function setWebhook() {
    const webhookInfo = await getWebhookInfo();
    if (webhookInfo && webhookInfo.url === `${process.env.HOST}/webhook`) {
        console.log("Вебхук уже установлен, повторная установка не требуется.");
        return; // Если вебхук уже установлен, выходим из функции
    }

    await deleteWebhook(); // Удаляем существующий вебхук
    const url = `https://api.telegram.org/bot${process.env.TOKEN}/setWebhook?url=${process.env.HOST}/webhook`;
    console.log("Устанавливаем вебхук на URL:", url); // Логируем URL
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Ошибка установки вебхука: ${response.status}`);
    } else {
        console.log("Вебхук успешно установлен!");
    }
}

// Обработка входящих обновлений от Telegram
app.post('/webhook', express.json(), async (req, res) => {
    const update = req.body;
    console.log('Получено обновление:', update);

    // Проверяем, есть ли фото в сообщении
    if (update.channel_post && update.channel_post.photo) {
        const photo = update.channel_post.photo[update.channel_post.photo.length - 1];
        const fileId = photo.file_id;

        // Получаем путь к файлу
        const filePath = await getFilePath(fileId);
        const imageUrl = `https://api.telegram.org/file/bot${process.env.TOKEN}/${filePath}`;

        // Проверяем доступность изображения
        if (await checkImageAvailability(imageUrl)) {
            console.log(`Доступное изображение: ${imageUrl}`);
            const text = update.channel_post.caption || ""; // Извлечение текста из caption
            const authorMatch = text.match(/Автор:(.*)/);
            const authorText = authorMatch ? authorMatch[1].trim() : "Неизвестный автор"; // Получаем автора

            // Сохраняем изображение и информацию об авторе
            currentImages.push({ url: imageUrl, text, author: authorText, fileId: fileId });
        } else {
            console.log(`Изображение недоступно: ${imageUrl}`);
        }
    } else if (update.channel_post && update.channel_post.delete_chat_photo) {
        console.log('Изображение удалено:', update.channel_post);

        // Удаляем изображение из currentImages
        const deletedPhotoId = update.channel_post.photo[0].file_id; // Получаем file_id удаленного фото
        currentImages = currentImages.filter(image => image.fileId !== deletedPhotoId); // Удаляем изображение по fileId
        console.log(`Изображение с ID ${deletedPhotoId} удалено из массива.`);
    }

    res.sendStatus(200); // Отправляем статус 200
});


// Получение изображений
app.get('/getImages', (req, res) => {
    console.log('Возвращаемые изображения:', currentImages);
    res.json(currentImages); // Возвращаем текущие изображения
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    setWebhook(); // Устанавливаем вебхук при запуске сервера
});

// Функции для работы с файлами
async function getFilePath(fileId) {
    const response = await fetch(`https://api.telegram.org/bot${process.env.TOKEN}/getFile?file_id=${fileId}`);
    const data = await response.json();
    return data.result.file_path;
}

async function checkImageAvailability(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error(`Ошибка при проверке доступности изображения ${url}:`, error);
        return false;
    }
}
