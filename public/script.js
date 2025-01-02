async function loadArts() {
    const artContainer = document.getElementById('artContainer');
    artContainer.innerHTML = '';

    try {
        const response = await fetch('/getImages'); 
        const images = await response.json();

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
