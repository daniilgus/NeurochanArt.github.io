import express from 'express';
import path from 'path';
import dotenv from 'dotenv'; 
import cors from 'cors';
import { getImages } from './bot.js'; // Импортируем функцию getImages из bot.js
import fetch from 'node-fetch';

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public')); 

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'app.html')); 
});

app.get('/getImages', async (req, res) => {
    try {
        const images = await getImages();
        console.log('Возвращаемые изображения:', images); // Логируем возвращаемые изображения
        res.json(images);
    } catch (error) {
        console.error('Error in /getImages route:', error.message); 
        res.status(500).send('Error fetching images');
    }
});

// Установка вебхука
async function setWebhook() {
    const url = `https://api.telegram.org/bot${process.env.TOKEN}/setWebhook?url=https://${process.env.HOST}/webhook`;
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
    console.log('Получено обновление:', update); // Логируем полученные обновления
    // Здесь вы можете вызвать функцию для обработки обновления
    await getImages(); // Или вызовите другую функцию для обработки
    res.sendStatus(200); // Отправляем статус 200
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    setWebhook(); // Устанавливаем вебхук при запуске сервера
});
