const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const TOKEN = process.env.TOKEN; // Используем переменную окружения

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    const update = req.body;

    if (update.channel_post && update.channel_post.photo) {
        const photo = update.channel_post.photo[update.channel_post.photo.length - 1];
        const fileId = photo.file_id;

        // Получаем путь к файлу
        const filePath = await getFilePath(fileId);
        const imageUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;

        // Проверяем доступность изображения
        if (await checkImageAvailability(imageUrl)) {
            console.log(`Доступное изображение: ${imageUrl}`);
        } else {
            console.log(`Изображение недоступно: ${imageUrl}`);
        }
    }

    // Отправляем ответ Telegram
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

async function getFilePath(fileId) {
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
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
