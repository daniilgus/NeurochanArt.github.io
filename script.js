const artData = [
    { imageUrl: 'https://t.me/c/2142769459/107689/135479', username: 'User 1' },
    { imageUrl: 'https://t.me/c/2142769459/107689/135464', username: 'User 2' },
    // Добавьте больше изображений и пользователей
];

function loadArts() {
    const artContainer = document.getElementById('artContainer');
    artContainer.innerHTML = ''; // Очистить контейнер перед загрузкой

    artData.forEach(art => {
        const artItem = document.createElement('div');
        artItem.className = 'art-item';
        artItem.innerHTML = `
            <img src="${art.imageUrl}" alt="${art.username}">
            <div>${art.username}</div>
        `;
        artContainer.appendChild(artItem);
    });
}

// Вызовите функцию при загрузке страницы
window.onload = loadArts;
