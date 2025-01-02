async function loadArts() {
    const artContainer = document.getElementById('artContainer');
    artContainer.innerHTML = ''; // Очищаем контейнер перед загрузкой новых изображений

    try {
        const response = await fetch('/getImages'); 
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const images = await response.json();

        if (images.length === 0) {
            artContainer.innerHTML = '<p>No images available.</p>';
            return;
        }

        images.forEach(image => {
            const artItem = document.createElement('div');
            artItem.className = 'art-item';
            artItem.setAttribute('data-text', `Автор: ${image.author}`); 

            const img = document.createElement('img');
            img.src = image.url;
            img.alt = "User  Art";
            img.onclick = () => openModal(image.url, image.text); 

            artItem.appendChild(img);
            artContainer.appendChild(artItem);
        });
    } catch (error) {
        console.error('Error loading arts:', error);
        artContainer.innerHTML = '<p>Error loading images. Please try again later.</p>';
    }
}

window.onload = loadArts; // Загружаем изображения при загрузке страницы
