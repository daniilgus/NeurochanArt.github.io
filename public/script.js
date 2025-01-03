let images = []; // Массив для хранения изображений

async function loadArts() {
    const artContainer = document.getElementById('artContainer');
    artContainer.innerHTML = '';

    try {
        const response = await fetch('/getImages');
        images = await response.json(); // Получаем изображения и сохраняем их в массив
        images.forEach(image => {
            const artItem = document.createElement('div');
            artItem.className = 'art-item';
            artItem.setAttribute('data-text', `Автор: ${image.author}`);

            const img = document.createElement('img');
            img.src = image.url;
            img.alt = "User  Art";
            img.onclick = () => openModal(image.url, image.text);
            artItem.appendChild(img);

            // Создаем контейнер для лайков
            const likeContainer = document.createElement('div');
            likeContainer.className = 'like-container';

            const likeButton = document.createElement('button');
            likeButton.innerText = '👍';
            likeButton.onclick = () => {
                image.likes = (image.likes || 0) + 1; // Увеличиваем количество лайков
                updateLikes(image); // Отправляем обновление на сервер
                likeCount.innerText = `Likes: ${image.likes}`; // Обновляем отображение лайков
            };

            const likeCount = document.createElement('span');
            likeCount.innerText = `Likes: ${image.likes || 0}`; // Изначально 0 лайков

            likeContainer.appendChild(likeButton);
            likeContainer.appendChild(likeCount);
            artItem.appendChild(likeContainer);

            artContainer.appendChild(artItem);
        });
    } catch (error) {
        console.error('Ошибка при загрузке изображений:', error);
    }
}
async function updateLikes(image) {
    try {
        await fetch('/updateLikes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: image.url }) // Отправляем URL изображения на сервер
        });
    } catch (error) {
        console.error('Ошибка при обновлении лайков:', error);
    }
}

function sortByDate() {
    images.sort((a, b) => new Date(b.date) - new Date(a.date)); // Сортируем по дате
    loadArts(); // Перезагружаем изображения
}

function sortByLikes() {
    images.sort((a, b) => (b.likes || 0) - (a.likes || 0)); // Сортируем по количеству лайков
    loadArts(); // Перезагружаем изображения
}

function openModal(imageUrl, text) {
    document.getElementById('modalImage').src = imageUrl;
    document.getElementById('modalText').innerHTML = text;
    document.getElementById('modal').style.display = 'block'; // Показываем модальное окно
}

function closeModal() {
    document.getElementById('modal').style.display = 'none'; // Скрываем модальное окно
}

window.onload = loadArts; // Загружаем арты при загрузке страницы

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal(); // Закрываем модальное окно при клике вне его
    }
}
