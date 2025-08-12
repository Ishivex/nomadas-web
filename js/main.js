// Importa las funciones que necesitas de los SDKs
import { initializeApp } from "[https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js](https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js)";
import { getFirestore, collection, getDocs, query, orderBy, addDoc, where, serverTimestamp } from "[https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js](https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js)";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "[https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js](https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js)";


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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

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
    signInWithPopup(auth, provider)
        .catch((error) => console.error("Error al iniciar sesión:", error));
}

function logOut() {
    signOut(auth)
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
    // Actualizar la vista de comentarios si la página del artículo está activa
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
        
        const articlesQuery = query(collection(db, "articles"), orderBy("order", "asc"));
        const articlesSnapshot = await getDocs(articlesQuery);
        articles = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const guidesQuery = query(collection(db, "guides"), orderBy("order", "asc"));
        const guidesSnapshot = await getDocs(guidesQuery);
        guides = guidesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        contentDB = [...articles, ...guides].reduce((acc, item) => ({ ...acc, [item.id]: item }), {});
        
        initializeAppUI();

    } catch (error) {
        console.error("Error al cargar datos desde Firebase: ", error);
        document.getElementById('pages-container').innerHTML = `<div class="text-center py-16"><p class="text-xl text-red-500">Error al cargar el contenido. Revisa la configuración de Firebase y las reglas de seguridad.</p></div>`;
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

        await addDoc(collection(db, "comments"), {
            articleId: articleId,
            userId: currentUser.uid,
            userName: currentUser.displayName,
            userAvatar: currentUser.photoURL,
            content: content.trim(),
            createdAt: serverTimestamp()
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

    // Renderizar el formulario de comentarios
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
    
    // Cargar y mostrar los comentarios existentes
    commentsContainer.innerHTML = '<p class="text-gray-500">Cargando comentarios...</p>';
    const commentsQuery = query(collection(db, "comments"), where("articleId", "==", articleId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(commentsQuery);
    
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
    onAuthStateChanged(auth, updateAuthUI);
}

// ... (El resto de las funciones de renderizado, navegación, etc. van aquí, sin cambios)
// ... (La inicialización de la herramienta de sorteo también va aquí)

// --- Iniciar la aplicación ---
fetchData();
