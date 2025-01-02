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

            images.push(`https://api.telegram.org/file/bot${TOKEN}/${filePath}`); 
        }
    }

    return images;
}

fetch('/getImages')
    .then(response => response.json())
    .then(images => {
        const artContainer = document.getElementById('artContainer');
        artContainer.innerHTML = ''; // Очистить контейнер перед добавлением новых изображений

        images.forEach(image => {
            const div = document.createElement('div');
            div.classList.add('art-item');

            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.text;

            const text = document.createElement('p');
            text.textContent = image.text; // Убедитесь, что это свойство правильно извлекается

            div.appendChild(img);
            div.appendChild(text);
            artContainer.appendChild(div);
        });
    })
    .catch(err => console.error(err));


getImages().then(images => {
    console.log(images); 
}).catch(err => console.error(err));
