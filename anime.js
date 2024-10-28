(async function() {
  const container = document.getElementById('anime-container');
  if (!container) {
    console.error('Error: Element with id "anime-container" not found');
    return;
  }

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  function isValidPath() {
    const path = window.location.pathname;
    return path.includes('/p/anime.html');
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  function createList(items) {
    if (!items || items.length === 0) return 'N/A';
    return items.map(item => item.name).join(', ');
  }

  function updateMetaTags(anime) {
    const currentUrl = window.location.href;

    document.querySelector('meta[property="og:url"]').setAttribute('content', currentUrl);
    document.querySelector('meta[property="og:title"]').setAttribute('content', anime.title);
    document.querySelector('meta[property="og:description"]').setAttribute('content', anime.synopsis || 'No synopsis available.');
    document.querySelector('title').innerText = `${anime.title} | Anime Details`;
    document.querySelector('meta[name="keywords"]').setAttribute('content', `${anime.title}, anime`);
    document.querySelector('meta[name="twitter:card"]').setAttribute('content', 'summary_large_image');
    document.querySelector('meta[property="twitter:title"]').setAttribute('content', anime.title);
    document.querySelector('meta[property="twitter:url"]').setAttribute('content', currentUrl);
    document.querySelector('meta[property="twitter:description"]').setAttribute('content', `${anime.title} - dcosmos2`);

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', currentUrl);
    } else {
      const newCanonicalLink = document.createElement('link');
      newCanonicalLink.setAttribute('rel', 'canonical');
      newCanonicalLink.setAttribute('href', currentUrl);
      document.head.appendChild(newCanonicalLink);
    }
  }

  if (!isValidPath()) {
    container.innerHTML = '<p>Anime information can only be viewed on the designated anime page.</p>';
    return;
  }

  const animeId = getQueryParam('id');

  if (!animeId) {
    container.innerHTML = '<p>No anime ID provided in URL. Add ?id=<anime_id> to the URL.</p>';
    return;
  }

  try {
    container.innerHTML = '<p>Loading anime data...</p>';

    const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const anime = data.data;

    if (!anime) {
      throw new Error('Anime not found');
    }

    updateMetaTags(anime);

    container.innerHTML = `
      <div class="anime-details">
        <div class="anime-header">
          <div class="anime-image-container">
            <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}" class="anime-image">
          </div>
          <div class="anime-title-info">
            <h1>${anime.title}</h1>
            ${anime.title_english ? `<h2>English: ${anime.title_english}</h2>` : ''}
            ${anime.title_japanese ? `<h2>Japanese: ${anime.title_japanese}</h2>` : ''}
            <div class="anime-quick-info">
              <p><strong>Type:</strong> ${anime.type || 'N/A'}</p>
              <p><strong>Episodes:</strong> ${anime.episodes || 'N/A'}</p>
              <p><strong>Status:</strong> ${anime.status || 'N/A'}</p>
              <p><strong>Score:</strong> ${anime.score ? `${anime.score} (${anime.scored_by.toLocaleString()} votes)` : 'N/A'}</p>
              <p><strong>Rank:</strong> ${anime.rank ? `#${anime.rank}` : 'N/A'}</p>
              <p><strong>Popularity:</strong> ${anime.popularity ? `#${anime.popularity}` : 'N/A'}</p>
            </div>
          </div>
        </div>
        ${anime.trailer?.embed_url ? `
          <div class="anime-trailer">
            <h3>Trailer</h3>
            <iframe width="100%" height="315" src="${anime.trailer.embed_url}" frameborder="0" allowfullscreen></iframe>
          </div>` : ''}
        <div class="anime-synopsis">
          <h3>Synopsis</h3>
          <p>${anime.synopsis || 'No synopsis available.'}</p>
        </div>
        ${anime.background ? `
          <div class="anime-background">
            <h3>Background</h3>
            <p>${anime.background}</p>
          </div>` : ''}
        <div class="anime-details-grid">
          <div class="detail-item">
            <h3>Information</h3>
            <p><strong>Source:</strong> ${anime.source || 'N/A'}</p>
            <p><strong>Season:</strong> ${anime.season ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}` : 'N/A'}</p>
            <p><strong>Aired:</strong> ${anime.aired?.string || 'N/A'}</p>
            <p><strong>Duration:</strong> ${anime.duration || 'N/A'}</p>
            <p><strong>Rating:</strong> ${anime.rating || 'N/A'}</p>
          </div>
          <div class="detail-item">
            <h3>Statistics</h3>
            <p><strong>Members:</strong> ${anime.members?.toLocaleString() || 'N/A'}</p>
            <p><strong>Favorites:</strong> ${anime.favorites?.toLocaleString() || 'N/A'}</p>
          </div>
          <div class="detail-item">
            <h3>Studios & Producers</h3>
            <p><strong>Studios:</strong> ${createList(anime.studios)}</p>
            <p><strong>Producers:</strong> ${createList(anime.producers)}</p>
            <p><strong>Licensors:</strong> ${createList(anime.licensors)}</p>
          </div>
          <div class="detail-item">
            <h3>Genres & Themes</h3>
            <p><strong>Genres:</strong> ${createList(anime.genres)}</p>
            <p><strong>Themes:</strong> ${createList(anime.themes)}</p>
            <p><strong>Demographics:</strong> ${createList(anime.demographics)}</p>
          </div>
        </div>
        ${anime.title_synonyms?.length ? `
          <div class="anime-synonyms">
            <h3>Alternative Titles</h3>
            <p>${anime.title_synonyms.join(', ')}</p>
          </div>` : ''}
      </div>
    `;
  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = `
      <div class="error">
        <p>Failed to load anime data.</p>
        <p>Error: ${error.message}</p>
      </div>
    `;
  }
})();
