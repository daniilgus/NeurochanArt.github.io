import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';

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

// Функция для чтения идентификаторов сообщений из файла
function readMessageIds() {
  if (fs.existsSync('messages.json')) {
    const data = fs.readFileSync('messages.json');
    return JSON.parse(data);
  }
  return [];
}

// Функция для записи идентификаторов сообщений в файл
function writeMessageIds(ids) {
  fs.writeFileSync('messages.json', JSON.stringify(ids));
}

async function getImages() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const images = [];
    const existingIds = readMessageIds();
    const currentIds = new Set(existingIds);

    for (const update of data.result) {
      if (update.channel_post && update.channel_post.photo) {
        const messageId = update.channel_post.message_id;
        const photo = update.channel_post.photo[update.channel_post.photo.length - 1];
        const fileId = photo.file_id;

        const fileResponse = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
        const fileData = await fileResponse.json();
        const filePath = fileData.result.file_path;
        const imageUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;
        const text = update.channel_post.text || update.channel_post.caption || "";

        if (!currentIds.has(messageId)) {
          images.push({ url: imageUrl, text });
          currentIds.add(messageId);
        }
      }
    }

    writeMessageIds(Array.from(currentIds));
    return images;
  } catch (error) {
    console.error('Ошибка при получении изображений:', error.message);
    throw error;
  }
}
app.get('/getImages', async (req, res) => {
    try {
      const images = await getImages();
      res.json(images);
    } catch (error) {
      console.error('Ошибка в маршруте /getImages:', error.message);
      res.status(500).json({ error: 'Ошибка при получении изображений' });
    }
  });
  
  app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
  });
  
