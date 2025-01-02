async function loadArts() {
    console.log('Loading arts...'); // Отладочный вывод
    const artContainer = document.getElementById('artContainer');
    artContainer.innerHTML = '';

    try {
        const response = await fetch('/getImages'); 
        const images = await response.json();

        artContainer.innerHTML = ''; 

        images.forEach(image => {
            const artItem = document.createElement('div');
            artItem.className = 'art-item';
            artItem.innerHTML = `
                <img src="${image.url}" alt="User  Art">
                <p>${image.text}</p> 
            `;
            artContainer.appendChild(artItem);
        });
    } catch (error) {
        console.error('Error loading arts:', error);
    }
}


async function fetchImages() {
    try {
        const response = await fetch('/getImages');
        const images = await response.json();

        const artContainer = document.getElementById('artContainer');
        artContainer.innerHTML = ''; 

        images.forEach(imageUrl => {
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = 'Art Image';
            imgElement.style.width = '200px'; 
            imgElement.style.margin = '10px';
            artContainer.appendChild(imgElement);
        });
    } catch (error) {
        console.error('Error fetching images:', error);
    }
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



window.onload = fetchImages;
window.onload = loadArts;



