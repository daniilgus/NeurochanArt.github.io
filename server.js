import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import dotenv from 'dotenv'; 
import cors from 'cors';

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000;

const TOKEN = process.env.TELEGRAM_BOT_TOKEN; 
const CHAT_ID = process.env.TELEGRAM_CHAT_ID; 

app.use(cors());
app.use(express.static('public')); 

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'app.html')); 
});

// Хранилище для идентификаторов загруженных изображений
let loadedImageIds = new Set();

async function getImages() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates`);
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Received data from Telegram:', data);

        const images = [];

        for (const update of data.result) {
            if (update.channel_post && update.channel_post.photo) {
                const photo = update.channel_post.photo[update.channel_post.photo.length - 1]; 
                const fileId = photo.file_id;

                // Проверяем, было ли это изображение уже загружено
                if (loadedImageIds.has(fileId)) {
                    continue; // Пропускаем, если изображение уже загружено
                }

                // Добавляем идентификатор в хранилище
                loadedImageIds.add(fileId);

                // Получаем информацию о файле
                const fileResponse = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
                if (!fileResponse.ok) {
                    console.error(`File not found for file_id: ${fileId}`);
                    continue; 
                }

                const fileData = await fileResponse.json();
                const filePath = fileData.result.file_path;
                const imageUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;

                // Проверка доступности файла
                const imageCheckResponse = await fetch(imageUrl);
                if (!imageCheckResponse.ok) {
                    console.error(`Image not accessible at: ${imageUrl}`);
                    continue; // Пропускаем недоступные изображения
                }

                const text = update.channel_post.text || update.channel_post.caption || "";
                const authorMatch = text.match(/Автор:(.*)/);
                const authorText = authorMatch ? authorMatch[1].trim() : "Неизвестный автор";
                images.push({ url: imageUrl, text: text, author: authorText });
            }
        }

        // Фильтрация изображений по их доступности в канале
        const uniqueImages = images.filter((image, index, self) =>
            index === self.findIndex((t) => (
                t.url === image.url
            ))
        );

        console.log('Extracted images:', uniqueImages); 
        return uniqueImages;
    } catch (error) {
        console.error('Error fetching images:', error.message);
        throw error;
    }
}

// Эндпоинт для получения изображений
app.get('/getImages', async (req, res) => {
    try {
        const images = await getImages();
        res.json(images);
    } catch (error) {
        console.error('Error in /getImages route:', error.message); 
        res.status(500).send('Error fetching images');
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
