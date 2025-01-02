const fetch = require('node-fetch'); 

const TOKEN = '8195705425:AAHjFZI_WI3xkXyGTqKDH3M8x67m48xAInc';
const CHAT_ID = '-1002287069041'; 

async function getImages() {
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates`); 
    const data = await response.json();

    const images = [];

    for (const update of data.result) { 
        if (update.channel_post && update.channel_post.photo) {
            const photo = update.channel_post.photo[update.channel_post.photo.length - 1]; 
            const fileId = photo.file_id;

            const fileResponse = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
            const fileData = await fileResponse.json();
            const filePath = fileData.result.file_path;
            const text = update.channel_post.text || update.channel_post.caption || "";
            const author = update.channel_post.from.username || "Неизвестный автор"; 

            images.push({ url: `https://api.telegram.org/file/bot${TOKEN}/${filePath}`, text: text, author: author }); 
        }
    }

    return images;
}


getImages().then(images => {
    console.log(images); 
}).catch(err => console.error(err));
