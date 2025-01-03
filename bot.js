const fetch = require('node-fetch');
const fs = require('fs');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN; 
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates`);
    const data = await response.json();

    const images = [];
    const existingIds = readMessageIds(); // Считываем существующие идентификаторы
    const currentIds = new Set(existingIds); // Используем Set для быстрого поиска

    for (const update of data.result) {
        if (update.channel_post && update.channel_post.photo) {
            const messageId = update.channel_post.message_id; // Получаем идентификатор сообщения
            const photo = update.channel_post.photo[update.channel_post.photo.length - 1];
            const fileId = photo.file_id;

            const fileResponse = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
            const fileData = await fileResponse.json();
            const filePath = fileData.result.file_path;

            const text = update.channel_post.text || update.channel_post.caption || "";

            const authorMatch = text.match(/Автор:(.*)/);
            const authorText = authorMatch ? authorMatch[1].trim() : "Неизвестный автор";

            images.push({ url: `https://api.telegram.org/file/bot${TOKEN}/${filePath}`, text: text, author: authorText });
            currentIds.add(messageId); // Добавляем новый идентификатор в Set
        }
    }

    // Проверяем, какие идентификаторы отсутствуют
    const deletedIds = existingIds.filter(id => !currentIds.has(id));
    if (deletedIds.length > 0) {
        console.log('Удаленные идентификаторы:', deletedIds);
        // Здесь вы можете добавить логику для удаления изображений с сайта
    }

    writeMessageIds(Array.from(currentIds)); // Сохраняем обновленный список идентификаторов
    return images;
}
getImages().then(images => {
    console.log(images);
}).catch(err => console.error(err));
