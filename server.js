import express from 'express';
import path from 'path';
import dotenv from 'dotenv'; 
import cors from 'cors';
import { getImages } from './bot.js'; // Импортируем функцию getImages из bot.js

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
