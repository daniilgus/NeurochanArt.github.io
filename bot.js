const fetch = require('node-fetch');
const fs = require('fs');

const TOKEN = '8195705425:AAHjFZI_WI3xkXyGTqKDH3M8x67m48xAInc'; // Замените на ваш токен

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
    const existingIds = readMessageIds(); // Считываем существующие идентификаторы
    const currentIds = new Set(existingIds); // Используем Set для быстрого поиска

    for (const update of data.result) {
      if (update.channel_post && update.channel_post.photo) {
        const messageId = update.channel_post.message_id; // Получаем идентификатор сообщения
        const photo = update.channel_post.photo[update.channel_post.photo.length - 1]; // Берем наибольшее изображение
        const fileId = photo.file_id;

        const fileResponse = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
        const fileData = await fileResponse.json();
        const filePath = fileData.result.file_path;
        const imageUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;
        const text = update.channel_post.text || update.channel_post.caption || "";

        // Проверяем, есть ли идентификатор в существующих
        if (!currentIds.has(messageId)) {
          images.push({ url: imageUrl, text });
          currentIds.add(messageId); // Добавляем новый идентификатор в Set
        }
      }
    }

    // Обновляем список идентификаторов
    writeMessageIds(Array.from(currentIds)); // Сохраняем обновленный список идентификаторов
    return images;
  } catch (error) {
    console.error('Ошибка при получении изображений:', error.message);
    throw error;
  }
}

getImages().then(images => {
  console.log(images);
}).catch(err => console.error('Ошибка:', err));
