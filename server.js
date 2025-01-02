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

async function getImages() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates`);
        if (!response.ok) {
            throw new Error(`Failed to fetch updates: ${response.statusText}`);
        }

        const data = await response.json();
        const images = [];

        if (!data.result || data.result.length === 0) {
            console.log('No updates found. Returning empty array.');
            return images; // Возвращаем пустой массив
        }

        for (const update of data.result) {
            if (update.channel_post && update.channel_post.photo) {
                const photo = update.channel_post.photo[update.channel_post.photo.length - 1];
                const fileId = photo.file_id;

                const fileResponse = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
                if (!fileResponse.ok) {
                    console.error(`File not found for file_id: ${fileId}`);
                    continue; // Пропускаем, если файл недоступен
                }

                const fileData = await fileResponse.json();
                const filePath = fileData.result.file_path;

                // Проверяем доступность файла по URL
                const imageCheckResponse = await fetch(`https://api.telegram.org/file/bot${TOKEN}/${filePath}`);
                if (!imageCheckResponse.ok) {
                    console.error(`Image not accessible at: https://api.telegram.org/file/bot${TOKEN}/${filePath}`);
                    continue; // Пропускаем, если изображение недоступно
                }

                const text = update.channel_post.text || update.channel_post.caption || "";
                const authorMatch = text.match(/Автор:(.*)/);
                const authorText = authorMatch ? authorMatch[1].trim() : "Неизвестный автор";

                images.push({ url: `https://api.telegram.org/file/bot${TOKEN}/${filePath}`, text: text, author: authorText });
            }
        }

        return images;
    } catch (error) {
        console.error('Error fetching images:', error.message);
        throw error; // Пробрасываем ошибку дальше
    }
}
app.get('/getImages', async (req, res) => {
    try {
        const images = await getValidImages(); // Используем новую функцию
        res.json(images);
    } catch (error) {
        console.error('Error in /getImages route:', error.message);
        res.status(500).send('Error fetching images');
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
