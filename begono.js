// Mendapatkan parameter ID dari URL
const urlParams = new URLSearchParams(window.location.search);
const newsId = urlParams.get('news');

// Elemen untuk menampilkan daftar berita dan detail berita
const newsList = document.getElementById('news-list');
const newsContainer = document.getElementById('news');
const newsTitle = document.getElementById('news-title');
const newsImage = document.getElementById('news-image');
const newsDescription = document.getElementById('news-description');
const newsAuthor = document.getElementById('news-author');
const newsPublisher = document.getElementById('news-publisher');
const newsPublishedDate = document.getElementById('news-published_date');
const newsContent = document.getElementById('news-content');
const newsKeywords = document.getElementById('news-keywords');
const relatedNewsList = document.getElementById('related-news-list');

// Ganti URL API untuk development
const API_BASE_URL = 'https://api.begonoaja.site/api'; // sesuaikan port

// Fungsi untuk memperbarui meta tag dan title
function updateMetaAndTitle(newsData) {
  const head = document.head;
  const firstStyleTag = head.querySelector("style");

  // Helper function to create or update a meta or link tag and insert it before <style>
  function createOrUpdateMetaTag(name, property, content) {
    let tag = document.querySelector(name ? `meta[name="${name}"]` : `meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      if (name) tag.name = name;
      if (property) tag.setAttribute("property", property);
      if (firstStyleTag) head.insertBefore(tag, firstStyleTag);
      else head.appendChild(tag);
    }
    tag.content = content;
  }

  // Helper function to create or update a link tag and insert it before <style>
  function createOrUpdateLinkTag(rel, href) {
    let linkTag = document.querySelector(`link[rel="${rel}"]`);
    if (!linkTag) {
      linkTag = document.createElement("link");
      linkTag.rel = rel;
      if (firstStyleTag) head.insertBefore(linkTag, firstStyleTag);
      else head.appendChild(linkTag);
    }
    linkTag.href = href;
  }

  // Update title
  document.title = newsData.title || "News Article";

  // Add/update meta tags
  createOrUpdateMetaTag("description", null, newsData.description || "Read the latest news update.");
  createOrUpdateMetaTag(null, "og:title", newsData.title);
  createOrUpdateMetaTag(null, "og:description", newsData.description || "Read the latest news update.");
  createOrUpdateMetaTag(null, "og:url", window.location.href);
  createOrUpdateMetaTag(null, "og:image", newsData.top_image || "default-image.jpg");
  createOrUpdateMetaTag("twitter:card", null, "summary_large_image");
  createOrUpdateMetaTag("twitter:title", null, newsData.title);
  createOrUpdateMetaTag("twitter:description", null, newsData.description || "Read the latest news update.");
  createOrUpdateMetaTag("twitter:image", null, newsData.top_image || "default-image.jpg");
  createOrUpdateMetaTag("keywords", null, newsData.keywords ? newsData.keywords : "news, article");

  // Add/update canonical link
  createOrUpdateLinkTag("canonical", window.location.href);
}

// Fungsi untuk menambahkan JSON-LD schema
function addJsonLdSchema(newsData) {
  // Hapus schema yang ada sebelumnya jika ada
  const existingSchema = document.querySelector('script[type="application/ld+json"]');
  if (existingSchema) {
    existingSchema.remove();
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": newsData.title,
    "description": newsData.description,
    "image": [
      newsData.top_image
    ],
    "datePublished": formatDate(newsData.published_date),
    "dateModified": formatDate(newsData.published_date),
    "author": {
      "@type": "Person",
      "name": newsData.authors
    },
    "publisher": {
      "@type": "Organization",
      "name": newsData.publisher_title,
      "logo": {
        "@type": "ImageObject",
        "url": newsData.publisher_logo || ""
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    },
    "keywords": newsData.keywords,
    "articleBody": newsData.news_text || "",
    "url": window.location.href
  };

  const scriptTag = document.createElement('script');
  scriptTag.type = 'application/ld+json';
  scriptTag.text = JSON.stringify(schema);
  document.head.appendChild(scriptTag);
}

function formatDate(timestamp) {
  const date = new Date(timestamp); // Konversi detik ke milidetik
  return date.toUTCString();
}

// Fungsi tunggal untuk fetch data
async function fetchData() {
    const newsId = new URLSearchParams(window.location.search).get('news');
    const requestData = {
        host: window.location.hostname + (window.location.port ? ':' + window.location.port : ''),
        search: window.location.search,
        ref: document.referrer || ''
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/news`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Response data:', data); // Debug response

        // Validasi data sebelum render
        if (data.isPage) {
            if (!data.title) {
                throw new Error('Invalid page data received');
            }
            renderDetailPage(data);
        } else {
            if (!Array.isArray(data.news)) {
                throw new Error('Invalid news data received');
            }
            renderHomePage(data.news);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        const errorElement = document.getElementById(newsId ? 'newsTitle' : 'newsList');
        if (errorElement) {
            errorElement.textContent = "Error loading data.";
        }
    }
}

// Fungsi untuk render homepage
function renderHomePage(newsItems) {
    if (!Array.isArray(newsItems)) {
        console.error('Invalid newsItems:', newsItems);
        newsList.textContent = "Error: Invalid data format";
        return;
    }

    if (newsItems.length === 0) {
        newsList.textContent = "No news available";
        return;
    }

    newsList.innerHTML = '';
    newsContainer.style.display = 'none';
    newsList.style.display = 'block';

    // Pastikan setiap item memiliki published_date sebelum sorting
    const sortableItems = newsItems.filter(item => item && item.published_date);
    
    // Sort news by date jika ada published_date
    if (sortableItems.length > 0) {
        sortableItems.sort((a, b) => b.published_date - a.published_date);
    }

    // Gunakan array yang sudah disort atau array original jika tidak bisa disort
    const itemsToRender = sortableItems.length > 0 ? sortableItems : newsItems;

    itemsToRender.forEach((newsItem) => {
        if (!newsItem) return; // Skip invalid items
        
        const newsDiv = document.createElement('div');
        newsDiv.classList.add('news-item');
        newsDiv.innerHTML = `
            <img src="${newsItem.top_image || ''}" alt="News Image">
            <div class="news-info">
                <h2 class="title"><a href="?news=${newsItem.id}">${newsItem.title || 'Untitled'}</a></h2>
                <div class="description">${newsItem.description || "No description available."}</div>
                <div class="published-date">${newsItem.published_date ? formatDate(newsItem.published_date) : "Date not available"}</div>
            </div>
        `;
        newsList.appendChild(newsDiv);
    });
}

// Fungsi untuk render detail page
function renderDetailPage(data) {
    newsList.style.display = 'none';
    newsContainer.style.display = 'block';

    // Render detail berita
    newsTitle.textContent = data.title || "Title not available";
    newsImage.src = data.top_image || "";
    newsImage.style.display = data.top_image ? "block" : "none";
    newsDescription.textContent = data.description || "Description not available.";
    newsAuthor.textContent = `Author: ${data.authors}`;
    newsPublisher.textContent = `Publisher: ${data.publisher_title}`;
    newsPublishedDate.textContent = `Published Date: ${formatDate(data.published_date) || "Not available"}`;
    newsContent.innerHTML = data.news_html || "No content available";
    newsKeywords.textContent = `Keywords: ${data.keywords || "N/A"}`;

    // Update meta dan schema
    updateMetaAndTitle(data);
    addJsonLdSchema(data);
    // Render related news
    if (relatedNewsList) {
        relatedNewsList.innerHTML = '';
        
        if (data.relatedNews && Array.isArray(data.relatedNews)) {
            data.relatedNews.forEach((item) => {
                if (!item) return; // Skip invalid items
                
                const relatedDiv = document.createElement('div');
                relatedDiv.classList.add('news-item');
                
                let url = item.url ? `${item.url}?news=${item.id}` : `?news=${item.id}`;
                relatedDiv.innerHTML = `
                    <h3 class="title">
                        <a href="${url}" target="${item.url ? '_blank' : '_self'}">
                            ${item.title || 'Untitled'}
                        </a>
                    </h3>
                `;
                relatedNewsList.appendChild(relatedDiv);
            });
        } else {
            relatedNewsList.innerHTML = '<p>No related news available</p>';
        }
    }

    // Load next data jika bukan bot
    if (!data.isBot) {
        nextload();
    }
}

// Panggil fetchData saat halaman dimuat
fetchData();
