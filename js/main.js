// Importa las funciones que necesitas de los SDKs
import { initializeApp } from "[https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js](https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js)";
import { getFirestore, collection, getDocs, query, orderBy } from "[https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js](https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js)";

// *******************************************************************
// ¡¡¡IMPORTANTE!!! PEGA AQUÍ TU OBJETO firebaseConfig
// Reemplaza este objeto de ejemplo con el tuyo.
// *******************************************************************
const firebaseConfig = {
    apiKey: "AIzaSyANBTJFreeGPUdKzQ7QolUfHYDL_gs40V4",
    authDomain: "nomadas-web-app.firebaseapp.com",
    projectId: "nomadas-web-app",
    storageBucket: "nomadas-web-app.firebasestorage.app",
    messagingSenderId: "815109694597",
    appId: "1:815109694597:web:01350f43ec11551d4035ec"

};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- ESTADO GLOBAL DE LA APLICACIÓN ---
let articles = [];
let guides = [];
let contentDB = {};
let lastActivePage = 'home-page';
let currentPage = 1;
let articlesPerPage = 3;
let currentFilter = 'All';

// --- LÓGICA DE CARGA DE DATOS DESDE FIREBASE ---
async function fetchData() {
    try {
        const pagesContainer = document.getElementById('pages-container');
        
        // Cargar Artículos
        const articlesQuery = query(collection(db, "articles"), orderBy("order", "asc"));
        const articlesSnapshot = await getDocs(articlesQuery);
        articles = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Cargar Guías
        const guidesQuery = query(collection(db, "guides"), orderBy("order", "asc"));
        const guidesSnapshot = await getDocs(guidesQuery);
        guides = guidesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Combinar en una "base de datos" local para fácil acceso
        contentDB = [...articles, ...guides].reduce((acc, item) => ({ ...acc, [item.id]: item }), {});
        
        // Una vez cargado, renderizar la aplicación
        initializeAppUI();

    } catch (error) {
        console.error("Error al cargar datos desde Firebase: ", error);
        const pagesContainer = document.getElementById('pages-container');
        pagesContainer.innerHTML = `<div class="text-center py-16"><p class="text-xl text-red-500">Error al cargar el contenido. Revisa la configuración de Firebase y las reglas de seguridad.</p></div>`;
    }
}


// --- LÓGICA DE RENDERIZADO DE LA UI ---
function initializeAppUI() {
    const pagesContainer = document.getElementById('pages-container');
    // Inyectar el HTML de todas las páginas
    pagesContainer.innerHTML = `
        <!-- PÁGINA DE NOTICIAS (HOME) -->
        <div id="home-page" class="page active">
            <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="mb-4"><input type="text" id="search-input" placeholder="Buscar en noticias..." class="bg-gray-800 border-2 border-gray-700 text-white placeholder-gray-400 rounded-full py-3 px-6 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></div>
                <div id="tags-container" class="flex flex-wrap gap-2 mb-8"></div>
                <section id="main-news-section" class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div id="featured-article-container" class="lg-col-span-2"></div>
                    <div id="secondary-articles-container" class="space-y-6"></div>
                </section>
                <section class="grid grid-cols-1">
                    <h2 class="text-2xl font-bold text-white mb-6 border-l-4 border-blue-500 pl-4">Todas las Noticias</h2>
                    <div id="latest-news-container" class="space-y-8"></div>
                    <div id="pagination-container" class="flex justify-center items-center space-x-2 mt-8"></div>
                </section>
            </main>
        </div>

        <!-- PÁGINA DE GUÍAS -->
        <div id="guides-page" class="page">
             <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 class="text-4xl font-bold text-white mb-8">Guías de Juegos</h1>
                <div id="guides-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"></div>
            </main>
        </div>
        
        <!-- PÁGINA DE SORTEOS -->
        <div id="giveaway-page" class="page">
            <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div id="giveaway-tool-container" class="relative w-full max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl shadow-indigo-500/10 p-6 md:p-8">
                    <!-- Contenido de la herramienta de sorteo se inicializará aquí -->
                </div>
            </main>
        </div>

        <!-- PÁGINA DE COMUNIDAD -->
        <div id="community-page" class="page">
            <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 class="text-4xl font-bold text-white mb-2">Únete a la Comunidad Nómada</h1>
                <p class="text-lg text-gray-400 mb-8">El viaje es mejor en compañía. Conéctate con otros Nómadas en nuestras redes.</p>
                <div class="bg-gray-800/50 rounded-lg p-8 flex flex-col md:flex-row items-center gap-8">
                    <div class="flex-shrink-0"><img src="[https://placehold.co/150x150/3B82F6/FFFFFF?text=Discord](https://placehold.co/150x150/3B82F6/FFFFFF?text=Discord)" class="rounded-full border-4 border-gray-700" alt="Logo de Discord"></div>
                    <div>
                        <h2 class="text-3xl font-bold text-white">Nuestro Servidor de Discord</h2>
                        <p class="text-gray-300 mt-2 mb-4">El corazón de nuestra comunidad. Aquí charlamos, organizamos partidas y compartimos las últimas novedades. ¡No te quedes fuera!</p>
                        <a href="[https://discord.gg](https://discord.gg)" target="_blank" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105">Entrar al Servidor</a>
                    </div>
                </div>
            </main>
        </div>

        <!-- PÁGINA DE ARTÍCULO INDIVIDUAL -->
        <div id="article-page" class="page">
            <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button id="back-button" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg mb-8 inline-flex items-center transition-transform hover:scale-105"><svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>Volver</button>
                <article>
                    <h1 id="article-title" class="text-4xl lg:text-5xl font-extrabold text-white mb-4"></h1>
                    <div class="flex items-center text-gray-400 mb-6"><span id="article-tag" class="tag mr-4"></span><span id="article-author">Por Nómadas</span></div>
                    <img id="article-image" src="" alt="Imagen del artículo" class="w-full h-auto max-h-[500px] object-cover rounded-lg mb-8">
                    <div id="article-content" class="prose prose-invert prose-lg max-w-none text-gray-300"></div>
                    <div class="mt-12 border-t border-gray-700 pt-8">
                        <h3 class="text-2xl font-bold text-white mb-6">Comentarios</h3>
                        <div class="bg-gray-800/50 rounded-lg p-6">
                            <textarea class="bg-gray-700 text-white placeholder-gray-400 w-full rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500" rows="4" placeholder="Escribe tu comentario..."></textarea>
                            <button class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Publicar</button>
                        </div>
                    </div>
                </article>
            </main>
        </div>
        
        <!-- Modal de Notificación -->
        <div id="notification-modal" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 hidden">
            <div class="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-center border border-gray-700">
                <p id="notification-message" class="text-lg text-white mb-6"></p>
                <button id="notification-close-btn" class="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">Cerrar</button>
            </div>
        </div>
    `;

    // Renderizar el contenido inicial
    renderTags();
    renderNews();
    renderGuides();
    initializeGiveawayTool();

    // Añadir los event listeners
    addEventListeners();
}

function addEventListeners() {
    // Navegación
    document.getElementById('home-link').addEventListener('click', (e) => { e.preventDefault(); showPage('home-page'); });
    document.getElementById('news-link').addEventListener('click', (e) => { e.preventDefault(); showPage('home-page'); });
    document.getElementById('guides-link').addEventListener('click', (e) => { e.preventDefault(); showPage('guides-page'); });
    document.getElementById('giveaway-link').addEventListener('click', (e) => { e.preventDefault(); showPage('giveaway-page'); });
    document.getElementById('community-link').addEventListener('click', (e) => { e.preventDefault(); showPage('community-page'); });
    document.getElementById('back-button').addEventListener('click', () => showPage(lastActivePage));

    // Interacciones
    document.getElementById('search-input').addEventListener('input', () => { currentPage = 1; renderNews(); });

    document.getElementById('tags-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('tag-filter')) {
            currentFilter = e.target.dataset.tag;
            currentPage = 1;
            document.querySelectorAll('.tag-filter').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            renderNews();
        }
    });
    
    document.getElementById('pagination-container').addEventListener('click', (e) => {
        if(e.target.classList.contains('pagination-btn')) {
            currentPage = Number(e.target.dataset.page);
            renderNews();
        }
    });

    document.body.addEventListener('click', (e) => {
        const item = e.target.closest('.news-item, .guide-item');
        if (item) showDetailView(item.dataset.id);
    });

    document.getElementById('notification-close-btn').addEventListener('click', () => {
        document.getElementById('notification-modal').classList.add('hidden');
    });
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    const activePage = document.querySelector('.page.active');
    if (activePage) lastActivePage = activePage.id;
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

function showDetailView(itemId) {
    const item = contentDB[itemId];
    if (!item) return;
    document.getElementById('article-title').textContent = item.title;
    document.getElementById('article-tag').textContent = item.tag || item.game;
    document.getElementById('article-image').src = item.imageHeader || item.image;
    document.getElementById('article-content').innerHTML = item.content;
    showPage('article-page');
}

function renderNews() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    let filteredArticles = articles.filter(a => 
        (currentFilter === 'All' || a.tag === currentFilter) &&
        (a.title.toLowerCase().includes(searchTerm) || a.summary.toLowerCase().includes(searchTerm))
    );

    const featuredContainer = document.getElementById('featured-article-container');
    const secondaryContainer = document.getElementById('secondary-articles-container');
    const latestContainer = document.getElementById('latest-news-container');
    featuredContainer.innerHTML = ''; secondaryContainer.innerHTML = ''; latestContainer.innerHTML = '';
    
    const mainNews = filteredArticles.slice(0, 3);
    if (mainNews.length > 0) {
        const [featured, ...secondary] = mainNews;
        featuredContainer.innerHTML = `<div class="card rounded-lg overflow-hidden h-full flex flex-col news-item" data-id="${featured.id}" style="animation-delay: 100ms;"><img src="${featured.imageCard}" alt="${featured.title}" class="w-full h-80 object-cover"><div class="p-6 flex-grow"><span class="tag mb-2 inline-block">${featured.tag}</span><h1 class="text-3xl font-bold text-white mb-3">${featured.title}</h1><p class="text-gray-400">${featured.summary}</p></div></div>`;
        secondary.forEach((article, index) => {
            secondaryContainer.innerHTML += `<div class="card rounded-lg p-5 news-item" data-id="${article.id}" style="animation-delay: ${200 + index * 100}ms;"><h3 class="font-bold text-white text-lg mb-2">${article.title}</h3><p class="text-sm text-gray-400">${article.summary}</p></div>`;
        });
    } else {
         latestContainer.innerHTML = `<p class="text-center text-gray-400 col-span-full py-8">No se encontraron noticias.</p>`;
    }

    const paginatedArticles = filteredArticles.slice(3);
    const start = (currentPage - 1) * articlesPerPage;
    const end = start + articlesPerPage;
    const articlesForPage = paginatedArticles.slice(start, end);

    latestContainer.innerHTML = ''; // Limpiar antes de renderizar
    articlesForPage.forEach((article, index) => {
        latestContainer.innerHTML += `<article class="card rounded-lg overflow-hidden md:flex news-item" data-id="${article.id}" style="animation-delay: ${100 + index * 100}ms;"><img src="${article.imageCard}" alt="${article.title}" class="md:w-1/3 h-48 md:h-auto object-cover"><div class="p-6"><span class="tag">${article.tag}</span><h3 class="text-xl font-bold text-white mt-2 mb-2">${article.title}</h3><p class="text-gray-400 text-sm">${article.summary}</p></div></article>`;
    });
    renderPagination(paginatedArticles.length);
}

function renderPagination(totalItems) {
    const container = document.getElementById('pagination-container');
    container.innerHTML = '';
    const totalPages = Math.ceil(totalItems / articlesPerPage);
    if (totalPages <= 1) return;
    container.innerHTML += `<button class="pagination-btn bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>`;
    container.innerHTML += `<button class="pagination-btn bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente</button>`;
}

function renderTags() {
    const container = document.getElementById('tags-container');
    const tags = ['All', ...new Set(articles.map(a => a.tag))];
    container.innerHTML = tags.map(tag => `<button class="tag-filter tag clickable ${tag === currentFilter ? 'active' : ''}" data-tag="${tag}">${tag}</button>`).join('');
}

function renderGuides() {
    const container = document.getElementById('guides-container');
    container.innerHTML = '';
    guides.forEach((guide, index) => {
        container.innerHTML += `<div class="card rounded-lg overflow-hidden flex flex-col guide-item" data-id="${guide.id}" style="animation-delay: ${100 + index * 100}ms;"><img src="${guide.image}" alt="${guide.title}" class="w-full h-48 object-cover"><div class="p-6 flex-grow"><span class="tag mb-2 inline-block">${guide.game}</span><h3 class="text-xl font-bold text-white">${guide.title}</h3></div></div>`;
    });
}


// --- LÓGICA DE LA HERRAMIENTA DE SORTEOS (Encapsulada) ---
function initializeGiveawayTool() {
    const container = document.getElementById('giveaway-tool-container');
    if (!container) return;

    // Inyectar el HTML de la herramienta de sorteos
    container.innerHTML = `
        <header class="text-center mb-2">
            <h1 id="main-title" class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Sorteos Nómadas</h1>
        </header>
        <input type="text" id="giveaway-title-input" placeholder="Dale un nombre a tu sorteo..." class="w-full text-center bg-transparent text-gray-300 border-none focus:ring-0 text-lg mb-6">
        <main>
            <div id="setup-container">
                <div id="participant-setup-wrapper">
                    <h2 class="text-xl font-semibold mb-3 text-cyan-400">1. Agregar Participantes</h2>
                    <div class="space-y-4">
                        <div>
                            <h3 class="font-medium mb-2 text-gray-400">Manualmente</h3>
                            <div class="flex flex-col sm:flex-row gap-3">
                                <input type="text" id="participant-input" placeholder="Nombre del participante" class="flex-grow w-full px-4 py-3 bg-gray-700 text-white border-2 border-gray-600 focus:border-indigo-500 focus:ring-0 rounded-lg transition-colors" />
                                <button id="add-participant-btn" class="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all transform hover:scale-105">Agregar</button>
                            </div>
                        </div>
                        <div>
                            <h3 class="font-medium mb-2 text-gray-400">Importar Lista</h3>
                            <textarea id="bulk-import-input" rows="3" placeholder="Pega una lista de nombres aquí (uno por línea)..." class="w-full p-3 bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-indigo-500 focus:ring-0"></textarea>
                            <button id="import-btn" class="w-full mt-2 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors">Importar</button>
                        </div>
                    </div>
                </div>
                <div id="prize-setup-wrapper" class="hidden">
                    <h2 class="text-xl font-semibold mb-3 text-cyan-400">1. Configurar Premios</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <input type="text" id="prize-name-input" placeholder="Nombre del premio" class="px-4 py-3 bg-gray-700 text-white border-2 border-gray-600 focus:border-indigo-500 focus:ring-0 rounded-lg">
                        <input type="number" id="prize-prob-input" placeholder="Probabilidad (%)" step="0.1" min="0.1" class="px-4 py-3 bg-gray-700 text-white border-2 border-gray-600 focus:border-indigo-500 focus:ring-0 rounded-lg">
                    </div>
                    <button id="add-prize-btn" class="w-full mb-4 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors">Agregar Premio</button>
                    <div id="prize-list" class="bg-gray-900/70 rounded-lg p-4 overflow-y-auto border border-gray-700"><p id="empty-prize-msg" class="text-gray-500">Aún no hay premios...</p></div>
                    <div class="flex justify-end items-center mt-2 gap-4">
                        <p class="font-semibold">Probabilidad Total: <span id="total-prob">0</span>%</p>
                        <button id="complete-prob-btn" class="px-3 py-1 text-xs bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">Completar</button>
                    </div>
                </div>
                <div id="participant-list-wrapper" class="my-6">
                    <h3 class="text-lg font-semibold mb-2">Lista de Participantes (<span id="participant-count">0</span>)</h3>
                    <div id="participants-list" class="bg-gray-900/70 rounded-lg p-4 overflow-y-auto border border-gray-700"><p id="empty-list-msg" class="text-gray-500">Aún no hay participantes...</p></div>
                </div>
                <div id="control-panel" class="p-4 rounded-lg">
                     <h2 class="text-xl font-semibold mb-3 text-cyan-400">2. Realizar Sorteo</h2>
                     <div class="mb-4">
                        <h3 class="font-medium mb-2">Modo de Sorteo:</h3>
                        <div class="grid grid-cols-2 md:grid-cols-5 gap-1 rounded-lg bg-gray-700 p-1">
                            <input type="radio" name="game-mode" id="mode-classic" value="classic" class="hidden mode-switch-input" checked><label for="mode-classic" class="mode-switch-label text-center p-2 rounded-md cursor-pointer font-semibold text-sm">Directo</label>
                            <input type="radio" name="game-mode" id="mode-elimination" value="elimination" class="hidden mode-switch-input"><label for="mode-elimination" class="mode-switch-label text-center p-2 rounded-md cursor-pointer font-semibold text-sm">Eliminación</label>
                            <input type="radio" name="game-mode" id="mode-tournament" value="tournament" class="hidden mode-switch-input"><label for="mode-tournament" class="mode-switch-label text-center p-2 rounded-md cursor-pointer font-semibold text-sm">Torneo</label>
                            <input type="radio" name="game-mode" id="mode-teams" value="teams" class="hidden mode-switch-input"><label for="mode-teams" class="mode-switch-label text-center p-2 rounded-md cursor-pointer font-semibold text-sm">Equipos</label>
                            <input type="radio" name="game-mode" id="mode-prize" value="prize" class="hidden mode-switch-input"><label for="mode-prize" class="mode-switch-label text-center p-2 rounded-md cursor-pointer font-semibold text-sm">Premios</label>
                        </div>
                     </div>
                     <div id="winner-count-wrapper" class="flex items-center gap-4 mb-4">
                        <label for="winner-count" class="font-medium">Número de ganadores:</label>
                        <input type="number" id="winner-count" value="1" min="1" class="w-20 px-3 py-2 bg-gray-700 border-gray-600 rounded-lg focus:border-indigo-500 focus:ring-0">
                     </div>
                     <div id="team-size-wrapper" class="hidden items-center gap-4 mb-4">
                        <label for="team-size" class="font-medium">Personas por equipo:</label>
                        <input type="number" id="team-size" value="2" min="2" class="w-20 px-3 py-2 bg-gray-700 border-gray-600 rounded-lg focus:border-indigo-500 focus:ring-0">
                     </div>
                     <button id="draw-winner-btn" class="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-xl rounded-lg hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 transition-all transform hover:scale-105 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:scale-100" disabled>¡Comenzar!</button>
                </div>
            </div>
            <div id="result-section" class="text-center hidden">
                <h2 id="result-title" class="text-2xl font-bold mb-4 text-cyan-400"></h2>
                <div id="roulette-wrapper" class="mb-6"><div id="roulette-reel"></div></div>
                <div id="prize-wheel-container" class="hidden"><div id="prize-wheel-pointer"></div><div id="prize-wheel"></div></div>
                <div id="winner-display" class="hidden"><div id="winner-list" class="space-y-3"></div></div>
                <button id="next-round-btn" class="hidden w-full mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Siguiente Ronda</button>
                <button id="export-btn" class="hidden w-full mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Guardar Resultados</button>
            </div>
            <div class="text-center mt-8">
                <button id="reset-btn" class="px-5 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">Reiniciar Sorteo</button>
            </div>
        </main>
    `;
    
    // El resto de la lógica del sorteo se pega aquí...
    // ... (código de la herramienta de sorteo)
}

// --- Iniciar la aplicación ---
fetchData();