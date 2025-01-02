const fetch = require('node-fetch'); 

const TOKEN = process.env.TELEGRAM_BOT_TOKEN; 
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let cachedImages = []; // Кэш для хранения изображений

async function getImages() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates`);
        if (!response.ok) {
            throw new Error(`Failed to fetch updates: ${response.statusText}`);
        }

        const data = await response.json();
        const images = [];

        if (!data.result || data.result.length === 0) {
            console.log('No updates found.');
            return cachedImages; // Возвращаем кэшированные изображения, если нет новых обновлений
        }

        for (const update of data.result) {
            if (update.channel_post && update.channel_post.photo) {
                const photo = update.channel_post.photo[update.channel_post.photo.length - 1];
                const fileId = photo.file_id;

                const fileResponse = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
                if (!fileResponse.ok) {
                    console.error(`File not found for file_id: ${fileId}`);
                    continue; // Пропускаем, если файл недоступен
                }

                const fileData = await fileResponse.json();
                const filePath = fileData.result.file_path;

                // Проверяем доступность файла по URL
                const imageCheckResponse = await fetch(`https://api.telegram.org/file/bot${TOKEN}/${filePath}`);
                if (!imageCheckResponse.ok) {
                    console.error(`Image not accessible at: https://api.telegram.org/file/bot${TOKEN}/${filePath}`);
                    continue; // Пропускаем, если изображение недоступно
                }

                const text = update.channel_post.text || update.channel_post.caption || "";
                const authorMatch = text.match(/Автор:(.*)/);
                const authorText = authorMatch ? authorMatch[1].trim() : "Неизвестный автор";

                images.push({ url: `https://api.telegram.org/file/bot${TOKEN}/${filePath}`, text: text, author: authorText });
            }
        }

        // Обновляем кэш изображений
        cachedImages = images;

        return images;
    } catch (error) {
        console.error('Error fetching images:', error.message);
        throw error;
    }
}


getImages().then(images => {
    console.log(images); 
}).catch(err => console.error(err));
