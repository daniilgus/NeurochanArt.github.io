async function loadArts() {
    const artContainer = document.getElementById('artContainer');
    artContainer.innerHTML = ''; // Очищаем контейнер перед загрузкой новых изображений

    try {
        // Добавляем временную метку к запросу, чтобы избежать кеширования
        const response = await fetch(`/getImages?_=${new Date().getTime()}`); 
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
            img.alt = "User  Art"; // Альтернативный текст для изображения
            img.onclick = () => openModal(image.url, image.text); // Открытие модального окна при клике

            artItem.appendChild(img);
            artContainer.appendChild(artItem);
        });
    } catch (error) {
        console.error('Ошибка загрузки изображений:', error);
        artContainer.innerHTML = '<p>Ошибка загрузки изображений. Попробуйте позже.</p>'; // Сообщение об ошибке
    }
}

// Вызов функции загрузки изображений при загрузке страницы
document.addEventListener('DOMContentLoaded', loadArts);
