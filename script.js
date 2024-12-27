const artData = [
    { imageUrl: 'https://t.me/c/2142769459/107689/135479', username: 'User 1' },
    { imageUrl: 'https://t.me/c/2142769459/107689/135464', username: 'User 2' },
    // Добавьте больше изображений и пользователей
];

async function loadArts() {
    const artContainer = document.getElementById('artContainer');
    artContainer.innerHTML = ''; // Очистить контейнер перед загрузкой

    // Получение изображений с сервера
    const response = await fetch('/path/to/your/server/getImages'); // Укажите путь к вашему серверу
    const images = await response.json();

    images.forEach(imageUrl => {
        const artItem = document.createElement('div');
        artItem.className = 'art-item';
        artItem.innerHTML = `
            <img src="${imageUrl}" alt="User  Art">
            <div>Username</div> <!-- Здесь можно добавить логику для отображения ника пользователя -->
        `;
        artContainer.appendChild(artItem);
    });
}

// Вызовите функцию при загрузке страницы
window.onload = loadArts;



