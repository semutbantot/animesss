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
        document.querySelector('title').innerText = \`\${anime.title} | Anime Details\`;
        document.querySelector('meta[name="keywords"]').setAttribute('content', \`\${anime.title}, anime\`);
        document.querySelector('meta[name="twitter:card"]').setAttribute('content', 'summary_large_image');
        document.querySelector('meta[property="twitter:title"]').setAttribute('content', anime.title);
        document.querySelector('meta[property="twitter:url"]').setAttribute('content', currentUrl);
        document.querySelector('meta[property="twitter:description"]').setAttribute('content', \`\${anime.title} - Blogspot\`);

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

        const response = await fetch(\`https://api.jikan.moe/v4/anime/\${animeId}\`);
        if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        const anime = data.data;

        if (!anime) {
            throw new Error('Anime not found');
        }

        updateMetaTags(anime);

        // Render anime details here
        container.innerHTML = \`
            <h1>\${anime.title}</h1>
            <p>\${anime.synopsis || 'No synopsis available.'}</p>
            <p>Release Date: \${formatDate(anime.aired.from)}</p>
            <p>Genres: \${createList(anime.genres)}</p>
        \`;

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = \`
            <div class="error">
                <p>Failed to load anime data.</p>
                <p>Error: \${error.message}</p>
            </div>
        \`;
    }
})();
