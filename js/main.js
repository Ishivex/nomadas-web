document.addEventListener('DOMContentLoaded', () => {

    // =======================================================================
    // =======================================================================
    //
    //          ¡¡¡ATENCIÓN!!! PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE
    //
    // Reemplaza todo el objeto `firebaseConfig` de abajo con el que copiaste
    //          de la configuración de tu proyecto en Firebase.
    //
    // =======================================================================
    // =======================================================================
    const firebaseConfig = {

  apiKey: "AIzaSyANBTJFreeGPUdKzQ7QolUfHYDL_gs40V4",
  authDomain: "nomadas-web-app.firebaseapp.com",
  projectId: "nomadas-web-app",
  storageBucket: "nomadas-web-app.firebasestorage.app",
  messagingSenderId: "815109694597",
  appId: "1:815109694597:web:01350f43ec11551d4035ec"

};


    // Inicializa Firebase usando el SDK compat
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();

    // --- ESTADO GLOBAL DE LA APLICACIÓN ---
    let articles = [];
    let guides = [];
    let contentDB = {};
    let currentUser = null;
    let lastActivePage = 'home-page';
    let currentPage = 1;
    let articlesPerPage = 3;
    let currentFilter = 'All';

    // --- LÓGICA DE AUTENTICACIÓN ---
    function signIn() {
        auth.signInWithPopup(provider)
            .catch((error) => console.error("Error al iniciar sesión:", error));
    }

    function logOut() {
        auth.signOut()
            .catch((error) => console.error("Error al cerrar sesión:", error));
    }

    function updateAuthUI(user) {
        currentUser = user;
        const authContainer = document.getElementById('auth-container');
        if (authContainer) {
            if (user) {
                authContainer.innerHTML = `
                    <img src="${user.photoURL}" alt="${user.displayName}" class="w-8 h-8 rounded-full mr-3 border-2 border-gray-600">
                    <span class="text-sm text-gray-300 mr-4 hidden sm:block">Hola, ${user.displayName.split(' ')[0]}</span>
                    <button id="logout-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-2 rounded-md text-sm">Salir</button>
                `;
                document.getElementById('logout-btn').addEventListener('click', logOut);
            } else {
                authContainer.innerHTML = `
                    <button id="login-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-md text-sm">Entrar con Google</button>
                    <a href="[https://ko-fi.com/Ishivex](https://ko-fi.com/Ishivex)" target="_blank" class="btn-donate text-gray-900 font-bold px-4 py-2 rounded-full text-sm ml-4">Apoyar</a>
                `;
                document.getElementById('login-btn').addEventListener('click', signIn);
            }
        }
        const articlePage = document.getElementById('article-page');
        if(articlePage && articlePage.classList.contains('active')) {
            const articleId = articlePage.dataset.articleId;
            if (articleId) {
                renderComments(articleId);
            }
        }
    }


    // --- LÓGICA DE CARGA DE DATOS DESDE FIREBASE ---
    async function fetchData() {
        try {
            const pagesContainer = document.getElementById('pages-container');
            
            const articlesSnapshot = await db.collection("articles").orderBy("order", "asc").get();
            articles = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const guidesSnapshot = await db.collection("guides").orderBy("order", "asc").get();
            guides = guidesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            contentDB = [...articles, ...guides].reduce((acc, item) => ({ ...acc, [item.id]: item }), {});
            
            initializeAppUI();

        } catch (error) {
            console.error("Error al cargar datos desde Firebase: ", error);
            document.getElementById('pages-container').innerHTML = `<div class="text-center py-16"><p class="text-xl text-red-500">Error al cargar el contenido. Revisa la consola para ver el error específico.</p></div>`;
        }
    }

    // --- LÓGICA DE COMENTARIOS ---
    async function postComment(articleId, content) {
        if (!currentUser) {
            showNotification("Debes iniciar sesión para poder comentar.");
            return;
        }
        if (!content.trim()) {
            showNotification("El comentario no puede estar vacío.");
            return;
        }

        try {
            const commentButton = document.getElementById('post-comment-btn');
            commentButton.disabled = true;
            commentButton.textContent = "Publicando...";

            await db.collection("comments").add({
                articleId: articleId,
                userId: currentUser.uid,
                userName: currentUser.displayName,
                userAvatar: currentUser.photoURL,
                content: content.trim(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            document.getElementById('comment-textarea').value = '';
            await renderComments(articleId);

        } catch (error) {
            console.error("Error al publicar comentario:", error);
            showNotification("Hubo un error al publicar tu comentario.");
        } finally {
            const commentButton = document.getElementById('post-comment-btn');
            if (commentButton) {
                commentButton.disabled = false;
                commentButton.textContent = "Publicar";
            }
        }
    }

    async function renderComments(articleId) {
        const commentsContainer = document.getElementById('comments-list');
        const commentFormContainer = document.getElementById('comment-form-container');
        if (!commentsContainer || !commentFormContainer) return;

        if (currentUser) {
            commentFormContainer.innerHTML = `
                <textarea id="comment-textarea" class="bg-gray-700 text-white placeholder-gray-400 w-full rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500" rows="4" placeholder="Escribe tu comentario..."></textarea>
                <button id="post-comment-btn" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Publicar</button>
            `;
            document.getElementById('post-comment-btn').addEventListener('click', () => {
                const content = document.getElementById('comment-textarea').value;
                postComment(articleId, content);
            });
        } else {
            commentFormContainer.innerHTML = `<p class="text-center text-gray-400">Debes <button id="login-comment-btn" class="text-blue-400 hover:underline font-bold">iniciar sesión</button> para comentar.</p>`;
            document.getElementById('login-comment-btn').addEventListener('click', signIn);
        }
        
        commentsContainer.innerHTML = '<p class="text-gray-500">Cargando comentarios...</p>';
        const querySnapshot = await db.collection("comments").where("articleId", "==", articleId).orderBy("createdAt", "desc").get();
        
        if (querySnapshot.empty) {
            commentsContainer.innerHTML = '<p class="text-gray-500">Sé el primero en comentar.</p>';
            return;
        }

        commentsContainer.innerHTML = '';
        querySnapshot.forEach(doc => {
            const comment = doc.data();
            const date = comment.createdAt ? comment.createdAt.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric'}) : 'Ahora';
            const commentEl = document.createElement('div');
            commentEl.className = 'flex items-start space-x-4 py-4 border-b border-gray-700 last:border-b-0';
            commentEl.innerHTML = `
                <img class="w-10 h-10 rounded-full" src="${comment.userAvatar}" alt="${comment.userName}">
                <div class="flex-1">
                    <div class="flex items-center justify-between">
                        <p class="font-bold text-white">${comment.userName}</p>
                        <p class="text-xs text-gray-500">${date}</p>
                    </div>
                    <p class="text-gray-300 mt-1 whitespace-pre-wrap">${comment.content}</p>
                </div>
            `;
            commentsContainer.appendChild(commentEl);
        });
    }


    // --- LÓGICA DE RENDERIZADO DE LA UI ---
    function initializeAppUI() {
        const pagesContainer = document.getElementById('pages-container');
        pagesContainer.innerHTML = `
            <div id="home-page" class="page active">
                <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div class="mb-4"><input type="text" id="search-input" placeholder="Buscar en noticias..." class="bg-gray-800 border-2 border-gray-700 text-white placeholder-gray-400 rounded-full py-3 px-6 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></div>
                    <div id="tags-container" class="flex flex-wrap gap-2 mb-8"></div>
                    <section id="main-news-section" class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        <div id="featured-article-container" class="lg:col-span-2"></div>
                        <div id="secondary-articles-container" class="space-y-6"></div>
                    </section>
                    <section class="grid grid-cols-1">
                        <h2 class="text-2xl font-bold text-white mb-6 border-l-4 border-blue-500 pl-4">Todas las Noticias</h2>
                        <div id="latest-news-container" class="space-y-8"></div>
                        <div id="pagination-container" class="flex justify-center items-center space-x-2 mt-8"></div>
                    </section>
                </main>
            </div>
            <div id="guides-page" class="page">
                 <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 class="text-4xl font-bold text-white mb-8">Guías de Juegos</h1>
                    <div id="guides-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"></div>
                </main>
            </div>
            <div id="giveaway-page" class="page">
                <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div id="giveaway-tool-container" class="relative w-full max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl shadow-indigo-500/10 p-6 md:p-8"></div>
                </main>
            </div>
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
                            <div id="comment-form-container" class="bg-gray-800/50 rounded-lg p-6 mb-8"></div>
                            <div id="comments-list" class="space-y-4"></div>
                        </div>
                    </article>
                </main>
            </div>
            <div id="notification-modal" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 hidden">
                <div class="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-center border border-gray-700">
                    <p id="notification-message" class="text-lg text-white mb-6"></p>
                    <button id="notification-close-btn" class="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">Cerrar</button>
                </div>
            </div>
        `;
        renderTags();
        renderNews();
        renderGuides();
        initializeGiveawayTool();
        addEventListeners();
        auth.onAuthStateChanged(updateAuthUI);
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
        
        const articlePage = document.getElementById('article-page');
        articlePage.dataset.articleId = item.id; // Guardar el ID para los comentarios

        document.getElementById('article-title').textContent = item.title;
        document.getElementById('article-tag').textContent = item.tag || item.game;
        document.getElementById('article-image').src = item.imageHeader || item.image;
        document.getElementById('article-content').innerHTML = item.content;
        showPage('article-page');
        renderComments(item.id); // Cargar comentarios al ver el artículo
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

    function showNotification(message) {
        const notificationMessage = document.getElementById('notification-message');
        const notificationModal = document.getElementById('notification-modal');
        if (notificationMessage && notificationModal) {
            notificationMessage.textContent = message;
            notificationModal.classList.remove('hidden');
        }
    }


    // --- LÓGICA DE LA HERRAMIENTA DE SORTEOS (Encapsulada) ---
    function initializeGiveawayTool() {
        // ... (El código completo de la herramienta de sorteo va aquí, sin cambios)
    }

    // --- Iniciar la aplicación ---
    fetchData();
});
