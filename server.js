import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received data from Telegram:', data);

    const images = [];
    const existingIds = readMessageIds(); // Считываем существующие идентификаторы
    const currentIds = new Set(existingIds); // Используем Set для быстрого поиска

    for (const update of data.result) {
      if (update.channel_post && update.channel_post.photo) {
        const messageId = update.channel_post.message_id; // Получаем идентификатор сообщения
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
        const imagePath = `public/images/${filePath}`;

        const text = update.channel_post.text || update.channel_post.caption || "";
        const authorMatch = text.match(/Автор:(.*)/);
        const authorText = authorMatch ? authorMatch[1].trim() : "Неизвестный автор";

        // Добавляем идентификатор в новый набор
        newIds.add(messageId);
        // Если идентификатор новый, добавляем изображение в массив
        if (!currentIds.has(messageId)) {
          images.push({ url: imageUrl, text: text, author: authorText, imagePath });
        }
      }
    }

    // Обновляем messages.json только с актуальными идентификаторами
    const updatedIds = existingIds.filter(id => newIds.has(id)); // Сохраняем только актуальные идентификаторы
    writeMessageIds(updatedIds); // Записываем обновленный список идентификаторов

    console.log('Extracted images:', images);
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

app.delete('/deleteImage/:imagePath', async (req, res) => {
  try {
    const { imagePath } = req.params;
    const imageFilePath = `public/images/${imagePath}`;

    // Проверьте, существует ли файл изображения
    if (fs.existsSync(imageFilePath)) {
      // Удалите файл изображения
      fs.unlinkSync(imageFilePath);
      res.status(200).send('Изображение успешно удалено');
    } else {
      res.status(404).send('Изображение не найдено');
    }
  } catch (error) {
    console.error('Ошибка при удалении изображения:', error.message);
    res.status(500).send('Ошибка при удалении изображения');
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
