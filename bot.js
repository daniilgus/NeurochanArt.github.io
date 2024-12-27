const fetch = require('node-fetch');

const TOKEN = '8195705425:AAHjFZI_WI3xkXyGTqKDH3M8x67m48xAInc';
const CHAT_ID = '-1002287069041'; // Замените на ваш CHAT_ID

async function getImages() {
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates`);
    const data = await response.json();

    const images = [];

    data.result.forEach(update => {
        if (update.message && update.message.chat.id === Number(CHAT_ID) && update.message.photo) {
            const photo = update.message.photo[update.message.photo.length - 1]; 
            const fileId = photo.file_id;

            images.push(`https://api.telegram.org/file/bot${TOKEN}/${fileId}`);
        }
    });

    return images;
}

getImages().then(images => {
    console.log(images); 
}).catch(err => console.error(err));
