import fetch from 'node-fetch';

const TOKEN = process.env.TOKEN;
const CHAT_ID = '-1002287069041';

let currentImages = new Set(); // Хранит текущие доступные изображения

async function getFilePath(fileId) {
    const fileResponse = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
    if (!fileResponse.ok) {
        console.error(`HTTP error! status: ${fileResponse.status}`);
        throw new Error(`HTTP error! status: ${fileResponse.status}`);
    }
    const fileData = await fileResponse.json();
    return fileData.result.file_path;
}

async function checkImageAvailability(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok; // Возвращает true, если изображение доступно
    } catch (error) {
        console.error(`Ошибка при проверке доступности изображения ${url}:`, error);
        return false; // Возвращаем false в случае ошибки
    }
}

export async function getImages() {
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates`);
    if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    const images = [];
    const uniqueUrls = new Set(); // Используем Set для хранения уникальных URL

    for (const update of data.result) {
        if (update.channel_post && update.channel_post.photo) {
            const photo = update.channel_post.photo[update.channel_post.photo.length - 1];
            const fileId = photo.file_id;

            // Получаем путь к файлу
            const filePath = await getFilePath(fileId);
            const imageUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;

            // Проверяем, является ли URL уникальным
            if (!uniqueUrls.has(imageUrl)) {
                uniqueUrls.add(imageUrl);
                const text = update.channel_post.text || update.channel_post.caption || "";
                const authorMatch = text.match(/Автор:(.*)/);
                const authorText = authorMatch ? authorMatch[1].trim() : "Неизвестный автор";

                // Проверяем доступность изображения
                if (await checkImageAvailability(imageUrl)) {
                    images.push({ url: imageUrl, text: text, author: authorText });
                } else {
                    console.log(`Изображение недоступно: ${imageUrl}`);
                }
            }
        }
    }

    console.log('Доступные изображения:', images); // Логируем доступные изображения
    return images; 
}


