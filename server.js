import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

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

    if (!data.result || data.result.length === 0) {
      console.log('No new updates found.');
      return [];
    }

    const images = [];
    const existingIds = readMessageIds(); // Считываем существующие идентификаторы
    const currentIds = new Set(existingIds); // Используем Set для быстрого поиска

    for (const update of data.result) {
      if (update.channel_post && update.channel_post.photo) {
        // Ваш существующий код для обработки изображений
      }
    }

    // Обновляем список идентификаторов
    writeMessageIds(Array.from(currentIds)); // Сохраняем обновленный список идентификаторов
    return images;
  } catch (error) {
    console.error('Ошибка при получении изображений:', error.message);
    throw error; // Пробрасываем ошибку дальше
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
