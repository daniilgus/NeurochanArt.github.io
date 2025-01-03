const fetch = require('node-fetch');

const TOKEN = '8195705425:AAGEBMFz4SDca5NLicRIwhr8JyqsIRTbp7I'; // Замените на ваш токен
const CHAT_ID = '-1002287069041'; 

async function getImages() {
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates`);
    const data = await response.json();

    const images = [];

    for (const update of data.result) {
        if (update.channel_post && update.channel_post.photo) {
            const photo = update.channel_post.photo[update.channel_post.photo.length - 1]; // Получаем самое большое изображение
            const fileId = photo.file_id;

            const fileResponse = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
            const fileData = await fileResponse.json();

            const filePath = fileData.result.file_path;
            const imageUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;

            const text = update.channel_post.caption || "";
            const authorMatch = text.match(/Автор:(.*)/);
            const authorText = authorMatch ? authorMatch[1].trim() : "Неизвестный автор";

            images.push({ url: imageUrl, text: text, author: authorText });
        }
    }

    return images; // Возвращаем массив изображений
}


getImages().then(images => {
    console.log(images); 
}).catch(err => console.error(err));
