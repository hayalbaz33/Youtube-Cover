const fileInput = document.querySelector("#fileInput");
const dropZone = document.querySelector("#dropZone");
const videoGrid = document.querySelector("#videoGrid");
const template = document.querySelector("#videoCardTemplate");
const toggleSamplesButton = document.querySelector("#toggleSamples");
const clearUploadsButton = document.querySelector("#clearUploads");
const uploadEmpty = document.querySelector("#uploadEmpty");
const searchForm = document.querySelector(".search");
const searchInput = document.querySelector("#searchInput");
const themeToggle = document.querySelector("#themeToggle");
const themeText = document.querySelector(".theme-text");
const publishedStatus = document.querySelector("#publishedStatus");
const sourceFilterButtons = document.querySelectorAll(".filter-btn");

const THEME_STORAGE_KEY = "youtube-preview-theme";
const CHANNEL_LOGO_PATH = "assets/hayalhanem-logo.png";
const PUBLISHED_THUMBNAILS_FOLDER = "published-thumbnails";
const PUBLISHED_MANIFEST_URL = `${PUBLISHED_THUMBNAILS_FOLDER}/manifest.json`;
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const PLACEHOLDER_THUMBNAIL = createThumb("Kapak Yuklenemedi", "published-thumbnails", "#2d2d2d", "#555555", "#ffffff", "abstract");

let uploadedThumbnails = [];
let publishedThumbnails = [];
let activeFilter = "all";
let showSamples = true;

const mockVideos = [
  {
    id: "sample-1",
    title: "New attack targets U.S. base in Syria following American airstrikes",
    channelName: "CBS News",
    views: "126K views",
    dateText: "2 hours ago",
    duration: "3:47",
    source: "sample",
    badgeText: "Örnek video",
    avatar: ["#f5f5f5", "#5f6368"],
    imageUrl: createThumb("CBS NEWS", "Desert Frontline", "#b9a17d", "#23201c", "#f7f1e7", "news"),
  },
  {
    id: "sample-2",
    title: "[Playlist] Soothing 24-hour playlist of jazz music and rain sounds for work",
    channelName: "In The Rain",
    views: "2M views",
    dateText: "3 months ago",
    duration: "23:59:40",
    source: "sample",
    badgeText: "Örnek video",
    avatar: ["#72512c", "#d8b56a"],
    imageUrl: createThumb("Work & Jazz", "rain sounds", "#14313c", "#c46930", "#fff7e6", "music"),
  },
  {
    id: "sample-3",
    title: "ABANDONED 1600's Mansion With EVERYTHING Left Inside",
    channelName: "Jeremy Xplores",
    views: "663K views",
    dateText: "5 months ago",
    duration: "36:15",
    source: "sample",
    badgeText: "Örnek video",
    avatar: ["#4b352b", "#c69b80"],
    imageUrl: createThumb("Frozen In Time", "abandoned mansion", "#2d3d36", "#ad7d55", "#f0e3d2", "mansion"),
  },
  {
    id: "sample-4",
    title: "YOUR QUESTIONS answered! March edition",
    channelName: "The Villages 365",
    views: "687 views",
    dateText: "9 hours ago",
    duration: "27:45",
    source: "sample",
    badgeText: "Örnek video",
    avatar: ["#7da06d", "#dceab8"],
    imageUrl: createThumb("Q&A", "March edition", "#d9c6ad", "#577c9c", "#ffffff", "talk"),
  },
  {
    id: "sample-5",
    title: "A shocking find in an oak tree",
    channelName: "Belko Wood",
    views: "52M views",
    dateText: "6 months ago",
    duration: "20:18",
    source: "sample",
    badgeText: "Örnek video",
    avatar: ["#6f4e32", "#d2a064"],
    imageUrl: createThumb("WTF?", "Oak tree discovery", "#855f3d", "#d7b57a", "#241610", "wood"),
  },
  {
    id: "sample-6",
    title: "1 in a Million MLB Moments",
    channelName: "blitz",
    views: "2.1M views",
    dateText: "1 month ago",
    duration: "10:39",
    source: "sample",
    badgeText: "Örnek video",
    avatar: ["#020202", "#4ed8e8"],
    imageUrl: createThumb("MLB Moments", "impossible catch", "#2d8d48", "#f4f7ff", "#ffffff", "sports"),
  },
  {
    id: "sample-7",
    title: "The Only Heckler I've Ever Kicked Out",
    channelName: "Drew Lynch",
    views: "404K views",
    dateText: "7 days ago",
    duration: "7:29",
    source: "sample",
    badgeText: "Örnek video",
    avatar: ["#433043", "#e6b98b"],
    imageUrl: createThumb("YOU'RE A D*CK!", "stand up", "#161b50", "#b04953", "#ffffff", "stage"),
  },
  {
    id: "sample-8",
    title: "223 hours video.",
    channelName: "Dharkness",
    views: "8.4M views",
    dateText: "2 years ago",
    duration: "223:36:40",
    source: "sample",
    badgeText: "Örnek video",
    avatar: ["#0c0c0c", "#727272"],
    imageUrl: createThumb("223 HOURS", "slow burn", "#c05f59", "#f3b07d", "#311111", "abstract"),
  },
  {
    id: "sample-9",
    title: "Garden of Eden - Lofi Deep Focus",
    channelName: "Chill Village",
    views: "36K views",
    dateText: "3 weeks ago",
    duration: "23:44:46",
    source: "sample",
    badgeText: "Örnek video",
    avatar: ["#d1782f", "#f2dd74"],
    imageUrl: createThumb("CHILL LOFI BEATS", "deep focus", "#417d72", "#f7a6c8", "#ffffff", "lofi"),
  },
];

function createThumb(title, subtitle, base, accent, text, type) {
  const shapes = {
    news: '<rect x="0" y="0" width="640" height="360" fill="url(#g)"/><path d="M0 240 C120 180 220 210 340 160 C470 104 540 132 640 76 L640 360 L0 360 Z" fill="rgba(0,0,0,.22)"/><rect x="78" y="180" width="140" height="52" rx="4" fill="rgba(255,255,255,.88)"/><rect x="236" y="158" width="170" height="88" rx="8" fill="rgba(32,32,32,.62)"/>',
    music: '<rect width="640" height="360" fill="url(#g)"/><circle cx="438" cy="192" r="56" fill="rgba(255,122,48,.76)"/><rect x="50" y="218" width="360" height="68" rx="10" fill="rgba(255,255,255,.08)"/><path d="M54 136 C154 92 260 106 365 76 C480 44 558 75 628 38" stroke="rgba(255,255,255,.22)" stroke-width="8" fill="none"/>',
    mansion: '<rect width="640" height="360" fill="url(#g)"/><rect x="120" y="142" width="360" height="132" rx="8" fill="rgba(220,173,117,.85)"/><path d="M94 152 L300 62 L520 152 Z" fill="rgba(70,55,48,.9)"/><rect x="192" y="184" width="54" height="90" fill="rgba(35,30,28,.78)"/><circle cx="548" cy="102" r="72" fill="rgba(255,255,255,.1)"/>',
    talk: '<rect width="640" height="360" fill="url(#g)"/><circle cx="224" cy="176" r="82" fill="rgba(255,255,255,.32)"/><circle cx="384" cy="168" r="76" fill="rgba(255,255,255,.22)"/><rect x="0" y="0" width="640" height="86" fill="rgba(255,255,255,.18)"/>',
    wood: '<rect width="640" height="360" fill="url(#g)"/><rect x="176" y="116" width="292" height="122" rx="14" fill="rgba(220,187,126,.9)"/><path d="M60 278 C170 218 306 266 434 220 C508 195 578 202 640 166 L640 360 L0 360 Z" fill="rgba(55,32,20,.58)"/><text x="86" y="96" font-size="42" font-family="Arial" font-weight="900" fill="#fff">WTF?</text>',
    sports: '<rect width="640" height="360" fill="url(#g)"/><rect y="250" width="640" height="110" fill="rgba(38,151,63,.95)"/><circle cx="324" cy="172" r="90" fill="none" stroke="#ff0b26" stroke-width="12"/><path d="M285 210 L352 145 L420 180" stroke="#fff" stroke-width="14" stroke-linecap="round" fill="none"/><circle cx="334" cy="140" r="9" fill="#fff"/>',
    stage: '<rect width="640" height="360" fill="url(#g)"/><circle cx="170" cy="174" r="84" fill="rgba(255,255,255,.22)"/><rect x="112" y="118" width="132" height="172" rx="42" fill="rgba(190,65,75,.78)"/><path d="M260 282 C372 220 480 224 620 170" stroke="rgba(255,255,255,.2)" stroke-width="34" fill="none"/>',
    abstract: '<rect width="640" height="360" fill="url(#g)"/><rect x="172" y="40" width="280" height="280" rx="30" fill="rgba(255,255,255,.13)" transform="rotate(-8 312 180)"/><rect x="218" y="82" width="186" height="198" rx="18" fill="rgba(0,0,0,.16)" transform="rotate(-8 312 180)"/>',
    lofi: '<rect width="640" height="360" fill="url(#g)"/><circle cx="490" cy="78" r="82" fill="rgba(255,166,200,.56)"/><path d="M0 292 C130 232 250 260 355 218 C460 176 540 206 640 144 L640 360 L0 360 Z" fill="rgba(45,95,77,.76)"/><rect x="76" y="154" width="138" height="110" rx="14" fill="rgba(255,255,255,.18)"/>',
  }[type] || '<rect width="640" height="360" fill="url(#g)"/>';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="${base}" offset="0"/>
          <stop stop-color="${accent}" offset="1"/>
        </linearGradient>
      </defs>
      ${shapes}
      <rect width="640" height="360" fill="rgba(0,0,0,.08)"/>
      <text x="34" y="304" fill="${text}" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="900">${escapeSvg(title)}</text>
      <text x="36" y="332" fill="${text}" opacity=".82" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700">${escapeSvg(subtitle)}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeSvg(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function addFiles(fileList) {
  const imageFiles = Array.from(fileList).filter((file) => file.type.startsWith("image/"));

  if (imageFiles.length === 0) {
    return;
  }

  const mapped = imageFiles.map((file) => ({
    id: crypto.randomUUID(),
    title: formatTitleFromFilename(file.name),
    channelName: "Your Channel",
    views: "Test önizleme",
    dateText: "Sadece tarayıcıda",
    duration: randomDuration(),
    avatar: ["#ff0033", "#3ea6ff"],
    imageUrl: URL.createObjectURL(file),
    source: "upload",
    badgeText: "Test kapağı",
    editable: true,
  }));

  uploadedThumbnails = [...mapped, ...uploadedThumbnails];
  fileInput.value = "";
  renderGrid();
}

function isImageFile(filename) {
  const lowerName = filename.toLowerCase();
  return IMAGE_EXTENSIONS.some((extension) => lowerName.endsWith(extension));
}

function formatTitleFromFilename(filename) {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1))
    .join(" ") || "Yeni Thumbnail";
}

function randomDuration() {
  const minutes = Math.floor(Math.random() * 18) + 2;
  const seconds = String(Math.floor(Math.random() * 60)).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function hashString(value) {
  return Array.from(value).reduce((hash, character) => ((hash << 5) - hash + character.charCodeAt(0)) >>> 0, 0);
}

function generateVideoMeta(seed) {
  const hash = hashString(seed);
  const minutes = (hash % 22) + 4;
  const seconds = String((hash >> 4) % 60).padStart(2, "0");
  const views = [`${(hash % 90) + 10} B görüntülenme`, `${(hash % 8) + 1}.${(hash >> 3) % 9} Mn görüntülenme`, `${(hash % 700) + 100} K görüntülenme`];
  const dates = ["Bugün", "1 gün önce", "3 gün önce", "1 hafta önce", "2 hafta önce", "1 ay önce"];

  return {
    duration: `${minutes}:${seconds}`,
    views: views[hash % views.length],
    dateText: dates[(hash >> 6) % dates.length],
  };
}

async function loadPublishedThumbnails() {
  setPublishedStatus("Yayınlanan kapaklar yükleniyor...");

  try {
    const manifestItems = await fetchPublishedFromManifest();

    publishedThumbnails = manifestItems
      .filter((file) => isImageFile(file.image || file.name || ""))
      .map(createPublishedThumbnailData);

    if (publishedThumbnails.length > 0) {
      setPublishedStatus(`${publishedThumbnails.length} yayınlanan kapak yüklendi.`);
    } else {
      setPublishedStatus("published-thumbnails klasöründe gösterilecek kapak bulunamadı.");
    }
  } catch (error) {
    console.warn("Yayınlanan kapaklar yüklenemedi:", error);
    publishedThumbnails = [];
    setPublishedStatus(error.message || "Yayınlanan kapaklar şu an yüklenemedi.", "warning");
  }

  renderGrid();
}

async function fetchPublishedFromManifest() {
  try {
    const response = await fetch(PUBLISHED_MANIFEST_URL, { cache: "no-store" });

    if (!response.ok) {
      console.warn(`${PUBLISHED_MANIFEST_URL} bulunamadı veya okunamadı. Yayınlanan kapaklar atlanıyor.`);
      return [];
    }

    const manifest = await response.json();
    if (!Array.isArray(manifest)) {
      console.warn(`${PUBLISHED_MANIFEST_URL} bir JSON array olmalı.`);
      return [];
    }

    return manifest;
  } catch (error) {
    console.warn("published-thumbnails manifest okunamadı:", error);
    return [];
  }
}

function createPublishedThumbnailData(file, index) {
  const imageUrl = file.image || "";
  const filename = imageUrl.split("/").pop() || file.title || `thumbnail-${index}`;
  const meta = generateVideoMeta(filename);

  return {
    id: `published-${index}`,
    title: file.title || formatTitleFromFilename(filename),
    imageUrl,
    channelName: "HayalHanem",
    duration: file.duration || meta.duration,
    views: file.views || meta.views,
    dateText: file.dateText || meta.dateText,
    source: "published",
    badgeText: "Yayınlandı",
    avatar: ["#ff0033", "#f5a623"],
  };
}

function getVisibleVideos() {
  const samples = showSamples ? mockVideos : [];

  if (activeFilter === "published") {
    return publishedThumbnails;
  }

  if (activeFilter === "uploads") {
    return uploadedThumbnails;
  }

  if (activeFilter === "samples") {
    return samples;
  }

  return [...uploadedThumbnails, ...publishedThumbnails, ...samples];
}

function setEmptyMessage(message) {
  const textNode = Array.from(uploadEmpty.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());

  if (textNode) {
    textNode.textContent = ` ${message}`;
  }
}

function renderGrid() {
  const videos = getVisibleVideos();
  videoGrid.replaceChildren();

  videos.forEach((video) => {
    const node = template.content.firstElementChild.cloneNode(true);
    const image = node.querySelector(".thumbnail");
    const title = node.querySelector(".video-title");
    const titleInput = node.querySelector(".title-editor input");
    const channel = node.querySelector(".channel");
    const stats = node.querySelector(".stats");
    const duration = node.querySelector(".duration");
    const avatar = node.querySelector(".avatar");
    const avatarImage = node.querySelector(".channel-avatar-img");
    const deleteButton = node.querySelector(".delete-btn");
    const editButton = node.querySelector(".edit-btn");
    const badge = node.querySelector(".source-badge");

    node.dataset.id = video.id;
    node.classList.toggle("uploaded", video.source === "upload");
    node.classList.toggle("published", video.source === "published");
    node.classList.toggle("sample", video.source === "sample");
    image.src = video.imageUrl;
    image.alt = video.title;
    image.onerror = () => {
      image.onerror = null;
      image.src = PLACEHOLDER_THUMBNAIL;
    };
    title.textContent = video.title;
    titleInput.value = video.title;
    channel.textContent = video.channelName;
    stats.textContent = `${video.views} • ${video.dateText}`;
    duration.textContent = video.duration;
    badge.textContent = video.badgeText;
    avatar.style.setProperty("--avatar-a", video.avatar[0]);
    avatar.style.setProperty("--avatar-b", video.avatar[1]);
    avatar.classList.remove("avatar-fallback");
    avatarImage.style.display = "";
    avatarImage.src = CHANNEL_LOGO_PATH;
    avatarImage.alt = video.channelName || "HayalHanem";
    avatarImage.onerror = () => {
      avatarImage.onerror = null;
      avatarImage.style.display = "none";
      avatar.classList.add("avatar-fallback");
    };

    if (video.editable) {
      deleteButton.addEventListener("click", () => removeUpload(video.id));
      editButton.addEventListener("click", () => startEditing(node, titleInput));
      titleInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          finishEditing(video.id, titleInput.value, node);
        }

        if (event.key === "Escape") {
          titleInput.value = video.title;
          node.classList.remove("editing");
        }
      });
      titleInput.addEventListener("blur", () => finishEditing(video.id, titleInput.value, node));
    }

    videoGrid.append(node);
  });

  clearUploadsButton.disabled = uploadedThumbnails.length === 0;
  toggleSamplesButton.textContent = showSamples ? "Örnek videoları gizle" : "Örnek videoları göster";
  uploadEmpty.classList.toggle("visible", videos.length === 0);
  setEmptyMessage(getEmptyMessage());
}

function render() {
  renderGrid();
}

function getEmptyMessage() {
  if (activeFilter === "published") {
    return "Yayınlanan kapak bulunamadı.";
  }

  if (activeFilter === "uploads") {
    return "Henüz test kapağı yüklenmedi.";
  }

  if (activeFilter === "samples" && !showSamples) {
    return "Örnek videolar şu an gizli.";
  }

  return "Gösterilecek kapak bulunamadı.";
}

function setPublishedStatus(message, type = "") {
  if (!publishedStatus) {
    return;
  }

  publishedStatus.textContent = message;
  publishedStatus.classList.toggle("visible", Boolean(message));
  publishedStatus.classList.toggle("warning", type === "warning");
}

function startEditing(card, input) {
  card.classList.add("editing");
  input.focus();
  input.select();
}

function finishEditing(id, value, card) {
  const nextTitle = value.trim() || "Yeni thumbnail";
  uploadedThumbnails = uploadedThumbnails.map((item) => (item.id === id ? { ...item, title: nextTitle } : item));
  card.classList.remove("editing");
  renderGrid();
}

function removeUpload(id) {
  const removed = uploadedThumbnails.find((item) => item.id === id);
  if (removed) {
    URL.revokeObjectURL(removed.imageUrl);
  }
  uploadedThumbnails = uploadedThumbnails.filter((item) => item.id !== id);
  renderGrid();
}

function clearUploads() {
  uploadedThumbnails.forEach((item) => URL.revokeObjectURL(item.imageUrl));
  uploadedThumbnails = [];
  fileInput.value = "";
  renderGrid();
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "dark";
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
}

function toggleTheme() {
  const currentTheme = document.body.dataset.theme || "dark";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
}

function applyTheme(theme) {
  const safeTheme = theme === "light" ? "light" : "dark";
  document.body.dataset.theme = safeTheme;
  updateThemeButton(safeTheme);
}

function updateThemeButton(theme) {
  if (!themeToggle || !themeText) {
    return;
  }

  const nextLabel = theme === "dark" ? "Açık" : "Koyu";
  themeText.textContent = nextLabel;
  themeToggle.setAttribute("aria-label", `${nextLabel} temaya geç`);
}

initTheme();
renderGrid();
loadPublishedThumbnails();

fileInput.addEventListener("change", (event) => addFiles(event.target.files));

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");
  });
});

dropZone.addEventListener("drop", (event) => addFiles(event.dataTransfer.files));

dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

toggleSamplesButton.addEventListener("click", () => {
  showSamples = !showSamples;
  renderGrid();
});

clearUploadsButton.addEventListener("click", clearUploads);

sourceFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter || "all";
    sourceFilterButtons.forEach((filterButton) => filterButton.classList.toggle("active", filterButton === button));
    renderGrid();
  });
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchInput.blur();
});
