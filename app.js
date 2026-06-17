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

const THEME_STORAGE_KEY = "youtube-preview-theme";

let uploads = [];
let showSamples = true;

const sampleVideos = [
  {
    id: "sample-1",
    title: "New attack targets U.S. base in Syria following American airstrikes",
    channel: "CBS News",
    stats: "126K views • 2 hours ago",
    duration: "3:47",
    avatar: ["#f5f5f5", "#5f6368"],
    thumbnail: createThumb("CBS NEWS", "Desert Frontline", "#b9a17d", "#23201c", "#f7f1e7", "news"),
  },
  {
    id: "sample-2",
    title: "[Playlist] Soothing 24-hour playlist of jazz music and rain sounds for work",
    channel: "In The Rain",
    stats: "2M views • 3 months ago",
    duration: "23:59:40",
    avatar: ["#72512c", "#d8b56a"],
    thumbnail: createThumb("Work & Jazz", "rain sounds", "#14313c", "#c46930", "#fff7e6", "music"),
  },
  {
    id: "sample-3",
    title: "ABANDONED 1600's Mansion With EVERYTHING Left Inside",
    channel: "Jeremy Xplores",
    stats: "663K views • 5 months ago",
    duration: "36:15",
    avatar: ["#4b352b", "#c69b80"],
    thumbnail: createThumb("Frozen In Time", "abandoned mansion", "#2d3d36", "#ad7d55", "#f0e3d2", "mansion"),
  },
  {
    id: "sample-4",
    title: "YOUR QUESTIONS answered! March edition",
    channel: "The Villages 365",
    stats: "687 views • 9 hours ago",
    duration: "27:45",
    avatar: ["#7da06d", "#dceab8"],
    thumbnail: createThumb("Q&A", "March edition", "#d9c6ad", "#577c9c", "#ffffff", "talk"),
  },
  {
    id: "sample-5",
    title: "A shocking find in an oak tree",
    channel: "Belko Wood",
    stats: "52M views • 6 months ago",
    duration: "20:18",
    avatar: ["#6f4e32", "#d2a064"],
    thumbnail: createThumb("WTF?", "Oak tree discovery", "#855f3d", "#d7b57a", "#241610", "wood"),
  },
  {
    id: "sample-6",
    title: "1 in a Million MLB Moments",
    channel: "blitz",
    stats: "2.1M views • 1 month ago",
    duration: "10:39",
    avatar: ["#020202", "#4ed8e8"],
    thumbnail: createThumb("MLB Moments", "impossible catch", "#2d8d48", "#f4f7ff", "#ffffff", "sports"),
  },
  {
    id: "sample-7",
    title: "The Only Heckler I've Ever Kicked Out",
    channel: "Drew Lynch",
    stats: "404K views • 7 days ago",
    duration: "7:29",
    avatar: ["#433043", "#e6b98b"],
    thumbnail: createThumb("YOU'RE A D*CK!", "stand up", "#161b50", "#b04953", "#ffffff", "stage"),
  },
  {
    id: "sample-8",
    title: "223 hours video.",
    channel: "Dharkness",
    stats: "8.4M views • 2 years ago",
    duration: "223:36:40",
    avatar: ["#0c0c0c", "#727272"],
    thumbnail: createThumb("223 HOURS", "slow burn", "#c05f59", "#f3b07d", "#311111", "abstract"),
  },
  {
    id: "sample-9",
    title: "Garden of Eden - Lofi Deep Focus",
    channel: "Chill Village",
    stats: "36K views • 3 weeks ago",
    duration: "23:44:46",
    avatar: ["#d1782f", "#f2dd74"],
    thumbnail: createThumb("CHILL LOFI BEATS", "deep focus", "#417d72", "#f7a6c8", "#ffffff", "lofi"),
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
  }[type];

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
    title: cleanTitle(file.name),
    channel: "Your Channel",
    stats: "Kapak önizlemesi",
    duration: randomDuration(),
    avatar: ["#ff0033", "#3ea6ff"],
    thumbnail: URL.createObjectURL(file),
    isUpload: true,
  }));

  uploads = [...mapped, ...uploads];
  fileInput.value = "";
  render();
}

function cleanTitle(fileName) {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Yeni thumbnail";
}

function randomDuration() {
  const minutes = Math.floor(Math.random() * 18) + 2;
  const seconds = String(Math.floor(Math.random() * 60)).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function render() {
  const videos = [...uploads, ...(showSamples ? sampleVideos : [])];
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
    const deleteButton = node.querySelector(".delete-btn");
    const editButton = node.querySelector(".edit-btn");

    node.dataset.id = video.id;
    node.classList.toggle("uploaded", Boolean(video.isUpload));
    node.classList.toggle("sample", !video.isUpload);
    image.src = video.thumbnail;
    image.alt = video.title;
    title.textContent = video.title;
    titleInput.value = video.title;
    channel.textContent = video.channel;
    stats.textContent = video.stats;
    duration.textContent = video.duration;
    avatar.style.setProperty("--avatar-a", video.avatar[0]);
    avatar.style.setProperty("--avatar-b", video.avatar[1]);

    if (video.isUpload) {
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

  clearUploadsButton.disabled = uploads.length === 0;
  uploadEmpty.classList.toggle("visible", uploads.length === 0);
  toggleSamplesButton.textContent = showSamples ? "Örnekleri gizle" : "Örnekleri göster";
}

function startEditing(card, input) {
  card.classList.add("editing");
  input.focus();
  input.select();
}

function finishEditing(id, value, card) {
  const nextTitle = value.trim() || "Yeni thumbnail";
  uploads = uploads.map((item) => (item.id === id ? { ...item, title: nextTitle } : item));
  card.classList.remove("editing");
  render();
}

function removeUpload(id) {
  const removed = uploads.find((item) => item.id === id);
  if (removed) {
    URL.revokeObjectURL(removed.thumbnail);
  }
  uploads = uploads.filter((item) => item.id !== id);
  render();
}

function clearUploads() {
  uploads.forEach((item) => URL.revokeObjectURL(item.thumbnail));
  uploads = [];
  fileInput.value = "";
  render();
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
  themeToggle.setAttribute("aria-label", `${nextLabel} temaya gec`);
}

initTheme();

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
  render();
});

clearUploadsButton.addEventListener("click", clearUploads);

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchInput.blur();
});

render();
