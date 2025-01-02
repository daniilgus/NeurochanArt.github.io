const fetch = require('node-fetch'); 

const TOKEN = '8195705425:AAHjFZI_WI3xkXyGTqKDH3M8x67m48xAInc';
const CHAT_ID = '-1002287069041'; 

async function getImages() {
    try {
        console.log(`Fetching updates with token: ${TOKEN}`); 
        const response = await fetch(`https://api.telegram.org/bot${TOKEN}getUpdates`); 

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`); 
            throw new Error(`HTTP error! status: ${response.status}`); 
        }

        const data = await response.json();
        console.log('Received data from Telegram:', data);

        const images = [];

        for (const update of data.result) {
            if (update.channel_post && update.channel_post.photo) {
                const photo = update.channel_post.photo[update.channel_post.photo.length - 1]; 
                const fileId = photo.file_id;

                const fileResponse = await fetch(`https://api.telegram.org/bot${TOKEN}getFile?file_id=${fileId}`); 

                if (!fileResponse.ok) {
                    console.error(`HTTP error! status: ${fileResponse.status}`); 
                    throw new Error(`HTTP error! status: ${fileResponse.status}`); 
                }

                const fileData = await fileResponse.json();
                const filePath = fileData.result.file_path;
                const imageUrl = `https://api.telegram.org/file/bot${TOKEN}${filePath}`;
                const username = update.channel_post.from ? update.channel_post.from.username || 'Неизвестный пользователь' : 'Неизвестный пользователь'; 

                images.push({ imageUrl, username });
            }
        }

        return images;
    } catch (error) {
        console.error('Error fetching images:', error.message);
        throw error;
    }
}

getImages().then(images => {
    console.log(images);
}).catch(err => console.error(err));
