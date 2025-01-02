import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import dotenv from 'dotenv'; 
import cors from 'cors'; // Добавим CORS

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000;

const TOKEN = process.env.TELEGRAM_BOT_TOKEN; 
const CHAT_ID = process.env.TELEGRAM_CHAT_ID; 

app.use(cors()); // Включаем CORS
app.use(express.static('public')); 

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'app.html')); 
});

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
                images.push(imageUrl);
            }
        }

        console.log('Extracted images:', images); 
        return images;
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
    console.log('Server is running on http://localhost:${PORT}');
});
