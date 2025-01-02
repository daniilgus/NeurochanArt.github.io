
async function loadArts() {
    const artContainer = document.getElementById('artContainer');
    artContainer.innerHTML = '';

    const response = await fetch('/getImages'); 
    const images = await response.json();

    images.forEach(imageUrl => {
        const artItem = document.createElement('div');
        artItem.className = 'art-item';
        artItem.innerHTML = `
            <img src="${imageUrl}" alt="UserArt">
            <div>Username</div> 
        `;
        artContainer.appendChild(artItem);
    });
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


window.onload = fetchImages;
window.onload = loadArts;




