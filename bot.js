const fetch = require('node-fetch');
const fs = require('fs');

const TOKEN = '8195705425:AAGEBMFz4SDca5NLicRIwhr8JyqsIRTbp7I'; // Замените на ваш токен
const CHAT_ID = '-1002287069041'; 

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

    for (const update of data.result) {
        if (update.channel_post && update.channel_post.photo) {
            const messageId = update.channel_post.message_id; // Получаем идентификатор сообщения
            if (!existingIds.includes(messageId)) { // Проверяем, есть ли он уже в списке
                const photo = update.channel_post.photo[update.channel_post.photo.length - 1];
                const fileId = photo.file_id;

                const fileResponse = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
                const fileData = await fileResponse.json();
                const filePath = fileData.result.file_path;

                const text = update.channel_post.text || update.channel_post.caption || "";

                const authorMatch = text.match(/Автор:(.*)/);
                const authorText = authorMatch ? authorMatch[1].trim() : "Неизвестный автор";

                images.push({ url: `https://api.telegram.org/file/bot${TOKEN}/${filePath}`, text: text, author: authorText });
                existingIds.push(messageId); // Добавляем новый идентификатор в список
            }
        }
    }

    writeMessageIds(existingIds); // Сохраняем обновленный список идентификаторов
    return images;
}

getImages().then(images => {
    console.log(images); 
}).catch(err => console.error(err));
