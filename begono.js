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
    "datePublished": new Date(newsData.published_date).toISOString(),
    "dateModified": new Date(newsData.published_date).toISOString(),
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
  const date = new Date(timestamp);
  return date.toUTCString();
}

// Fungsi untuk menampilkan daftar berita
async function fetchNewsList() {
  try {
    const response = await fetch('https://api.begonoaja.site/news/');
    const data = await response.json();

    // Urutkan data berdasarkan published_date secara descending
    data.sort((a, b) => b.published_date - a.published_date);

    newsList.innerHTML = ''; // Kosongkan daftar berita

    data.forEach((newsItem) => {
      const newsDiv = document.createElement('div');
      newsDiv.classList.add('news-item');
      newsDiv.innerHTML = `
        <img src="${newsItem.top_image}" alt="News Image">
        <div class="news-info">
          <h2 class="title"><a href="?news=${newsItem.id}">${newsItem.title}</a></h2>
          <div class="description">${newsItem.description || "No description available."}</div>
          <div class="published-date">${formatDate(newsItem.published_date) || "Date not available"}</div>
        </div>
      `;
      newsList.appendChild(newsDiv);
    });
  } catch (error) {
    newsList.innerHTML = "Error loading news list.";
    console.error("Error fetching news list:", error);
  }
}

// Fungsi untuk menampilkan detail berita dan judul acak terkait berdasarkan ID
async function fetchNewsData(id) {
  try {
    const response = await fetch('https://api.begonoaja.site/news/findById', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id })
    });
    const data = await response.json();
    // Load next data jika bukan bot
    if (data.isBot == false) {
      nextload();
    }
    // Menampilkan data berita dari struktur yang baru
    newsTitle.textContent = data.title || "Title not available";
    newsImage.src = data.top_image || ""; // Gambar utama
    newsImage.style.display = data.top_image ? "block" : "none"; // Sembunyikan jika tidak ada gambar
    newsDescription.textContent = data.description || "Description not available.";
    newsAuthor.textContent = `Author: ${data.authors}`; // Menampilkan nama penulis
    newsPublisher.textContent = `Publisher: ${data.publisher_title}`;
    newsPublishedDate.textContent = `Published Date: ${formatDate(data.published_date) || "Not available"}`;
    newsContent.innerHTML = data.news_html || "No content available";
    newsKeywords.textContent = `Keywords: ${data.keywords || "N/A"}`; // Menampilkan keywords

    // Update meta and title
    updateMetaAndTitle(data);
    
    // Add JSON-LD Schema
    addJsonLdSchema(data);

    // Menampilkan judul berita terkait di bagian bawah
    relatedNewsList.innerHTML = ''; // Kosongkan daftar berita terkait
    data.relatedNews.forEach((item) => {
      const relatedDiv = document.createElement('div');
      relatedDiv.classList.add('news-item');
      
      // Tentukan URL
      let url = ``;
      if(item.url){
        url = `${item.url}?news=${item.id}`
      } else{
        url = `?news=${item.id}`
      }
      
      // Template elemen dengan URL backlink
      relatedDiv.innerHTML = `<h3 class="title"><a href="${url}" target="${item.url ? '_blank' : '_self'}">${item.title}</a></h3>`;
      relatedNewsList.appendChild(relatedDiv);
    });

    newsContainer.style.display = 'block';
    newsList.style.display = 'none';
  } catch (error) {
    newsTitle.textContent = "Error loading news data.";
    console.error("Error fetching data:", error);
  }
}

// Memilih fungsi yang akan dijalankan
if (newsId) {
  fetchNewsData(newsId);
} else {
  fetchNewsList();
}
