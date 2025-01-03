import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import dotenv from 'dotenv'; 
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const TOKEN = '8195705425:AAGEBMFz4SDca5NLicRIwhr8JyqsIRTbp7I'; // Замените на ваш токен
const CHAT_ID = '-1002287069041';  

app.use(cors());
app.use(express.static('public')); 

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'app.html')); 
});

// Массив для хранения текущих изображений
let currentImages = [];

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
                const fileResponse = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
                if (!fileResponse.ok) {
                    console.error(`HTTP error! status: ${fileResponse.status}`);
                    throw new Error(`HTTP error! status: ${fileResponse.status}`);
                }
                const fileData = await fileResponse.json();
                const filePath = fileData.result.file_path;
                const imageUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;

                const text = update.channel_post.text || update.channel_post.caption || "";
                const authorMatch = text.match(/Автор:(.*)/);
                const authorText = authorMatch ? authorMatch[1].trim() : "Неизвестный автор";

                images.push({ url: imageUrl, text: text, author: authorText });
            }
        }

        // Обновляем текущие изображения
        currentImages = images; // Заменяем старые изображения новыми
        console.log('Current images:', currentImages);
        return currentImages;
    } catch (error) {
        console.error('Error fetching images:', error.message);
        throw error;
    }
}
app.get('/getImages', async (req, res) => {
    try {
        const images = await getImages();
        res.json(images);
    } catch (error) {
        console.error('Error in /getImages route:', error.message); 
        res.status(500).send('Error fetching images');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
