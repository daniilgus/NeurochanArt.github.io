async function loadArts() {
    const artContainer = document.getElementById('artContainer');
    artContainer.innerHTML = ''; // Очищаем контейнер перед загрузкой новых изображений

    try {
        const response = await fetch('/getImages'); 
        const images = await response.json();

        if (images.length === 0) {
            console.log('Нет доступных изображений.');
            artContainer.innerHTML = '<p>Нет доступных изображений.</p>'; // Сообщение, если изображений нет
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
        artContainer.innerHTML = '<p>Ошибка загрузки изображений. Попробуйте позже.</p>'; // Сообщение об ошибке
    }
}

window.onload = loadArts; // Загружаем изображения при загрузке страницы

function openModal(imageUrl, text) {
    document.getElementById('modalImage').src = imageUrl;
    document.getElementById('modalText').innerHTML = text; 
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}
