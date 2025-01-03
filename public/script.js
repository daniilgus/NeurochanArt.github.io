async function loadArts() {
  const artContainer = document.getElementById('artContainer');
  artContainer.innerHTML = '';

  try {
    const response = await fetch('/getImages', { method: 'GET', headers: { 'Cache-Control': 'no-cache' } });
    const images = await response.json();

    if (images.length === 0) {
      console.log('No images found.');
      return;
    }

    images.forEach(image => {
      const artItem = document.createElement('div');
      artItem.className = 'art-item';

      const img = document.createElement('img');
      img.src = image.url;
      img.alt = "User  Art";

      const textElement = document.createElement('p');
      textElement.innerText = image.text;

      artItem.appendChild(img);
      artItem.appendChild(textElement);
      artContainer.appendChild(artItem);
    });
  } catch (error) {
    console.error('Ошибка при загрузке артов:', error);
  }
}

window.onload = loadArts;
