// Fungsi untuk mendapatkan nilai dari query parameter di URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Ambil nilai ID dari query parameter
const animeId = getQueryParam('id');

// Jika ID tersedia, ambil data dari API
if (animeId) {
  fetch(`https://api.jikan.moe/v4/anime/${animeId}`)
    .then(response => response.json())
    .then(data => {
      // Render data dari API ke dalam HTML
      const anime = data.data;
      document.getElementById('anime-container').innerHTML = `
        <h1>${anime.title} (${anime.title_japanese})</h1>
        <p><strong>Episodes:</strong> ${anime.episodes}</p>
        <p><strong>Score:</strong> ${anime.score}</p>
        <p><strong>Synopsis:</strong> ${anime.synopsis}</p>
        <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
      `;
    })
    .catch(error => {
      console.error('Error fetching the anime data:', error);
      document.getElementById('anime-container').innerHTML = '<p>Failed to load anime data.</p>';
    });
} else {
  document.getElementById('anime-container').innerHTML = '<p>No anime ID provided.</p>';
}
