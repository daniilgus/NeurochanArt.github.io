async function loadArts() {
  const artContainer = document.getElementById('artContainer');
  artContainer.innerHTML = '';

  try {
    const response = await fetch('/getImages', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache' // Отключаем кэширование
      }
    });
    const images = await response.json();

    if (images.length === 0) {
      console.log('No images found.'); // Логируем, если изображений нет
      return; // Если изображений нет, ничего не добавляем
    }

    images.forEach(async (image) => {
      const artItem = document.createElement('div');
      artItem.className = 'art-item';
      artItem.setAttribute('data-text', `Автор: ${image.author}`);

      const img = document.createElement('img');
      img.src = image.url;
      img.alt = "User Art";
      img.onclick = () => openModal(image.url, image.text);

      // Добавьте кнопку удаления к элементу art
      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = 'Удалить';
      deleteButton.addEventListener('click', async () => {
        try {
          const response = await fetch(`/deleteImage/${image.imagePath}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            artItem.remove(); // Удалите элемент art из DOM
            console.log('Изображение успешно удалено');
          } else {
            console.error('Ошибка при удалении изображения:', await response.text());
          }
        } catch (error) {
          console.error('Ошибка при удалении изображения:', error.message);
        }
      });

      artItem.appendChild(img);
      artItem.appendChild(deleteButton);
      artContainer.appendChild(artItem);
    });
  } catch (error) {
    console.error('Ошибка при загрузке артов:', error);
  }
}

function openModal(imageUrl, text) {
  document.getElementById('modalImage').src = imageUrl;
  document.getElementById('modalText').innerHTML = text;
  document.getElementById('modal').style.display = 'block';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

window.onload = loadArts;

window.onclick = function(event) {
  const modal = document.getElementById('modal');
  if (event.target === modal) {
    closeModal();
  }
}
