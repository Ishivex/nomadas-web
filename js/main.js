// --- LÓGICA PRINCIPAL DE LA WEB (Noticias, Guías, Navegación) ---
document.addEventListener('DOMContentLoaded', () => {
    // --- BASE DE DATOS (Simulación) ---
    const articles = [
        { id: '7', title: '¡Prepárate! SpiritVale anuncia su playtest en Steam', tag: 'BETA', summary: 'El MMORPG de acción inspirado en clásicos abre sus puertas. Te contamos cómo solicitar acceso para ser de los primeros en probarlo.', imageCard: 'https://placehold.co/800x450/1F2937/FFFFFF?text=SpiritVale', imageHeader: 'https://placehold.co/1200x500/111827/FFFFFF?text=SpiritVale+Playtest', content: '<p>El equipo de Baikun Interactive ha anunciado el esperado playtest para <b>SpiritVale</b>, su nuevo MMORPG gratuito con un encantador estilo low-poly. Los jugadores ya pueden solicitar acceso a través de la página oficial del juego en Steam para participar en las pruebas y ayudar con el desarrollo.</p><p>SpiritVale promete un combate de acción, un profundo sistema de clases y un mundo lleno de secretos, enfocado en la cooperación sin elementos pay-to-win.</p>' },
        { id: '6', title: 'Recordando la Beta Cerrada de Drakantos', tag: 'ANÁLISIS', summary: 'Tras el fin de semana de beta cerrada, repasamos nuestras primeras impresiones del ambicioso MMORPG en pixel art.', imageCard: 'https://placehold.co/800x450/1F2937/FFFFFF?text=Drakantos', imageHeader: 'https://placehold.co/1200x500/111827/FFFFFF?text=Drakantos+Beta', content: '<p>El pasado fin de semana, del 25 al 27 de julio, miles de jugadores tuvieron la oportunidad de sumergirse en el mundo de Eldras durante la beta cerrada de <b>Drakantos</b>. El MMORPG de Wingeon Game Studios destacó por su precioso estilo pixel art y un sistema de combate rápido y dinámico.</p><p>Aunque hubo algunos problemas técnicos esperables, la comunidad ya debate sobre sus héroes favoritos y las estrategias para las mazmorras dinámicas. Sin duda, Drakantos es un proyecto a seguir de cerca.</p>' },
        { id: '5', title: 'Valheim recibe su actualización "Mistlands"', tag: 'ACTUALIZACIÓN', summary: 'Nuevos biomas, enemigos y mecánicas de crafteo llegan al popular juego de supervivencia vikingo.', imageCard: 'https://placehold.co/400x300/1F2937/FFFFFF?text=Valheim', imageHeader: 'https://placehold.co/1200x500/111827/FFFFFF?text=Valheim+Mistlands', content: '<p>Nuevos biomas, enemigos y mecánicas de crafteo llegan al popular juego de supervivencia vikingo. Las "Mistlands" son una nueva y peligrosa zona endgame llena de misterios y criaturas mágicas.</p>' },
        { id: '4', title: 'El parche 1.5 de Cyberpunk 2077 mejora el rendimiento', tag: 'ACTUALIZACIÓN', summary: 'CD Projekt RED sigue puliendo su juego con una actualización que trae mejoras de estabilidad y nuevo contenido gratuito.', imageCard: 'https://placehold.co/800x450/111827/FFFFFF?text=Cyberpunk', imageHeader: 'https://placehold.co/1200x500/111827/FFFFFF?text=Cyberpunk+Update', content: '<p>CD Projekt RED sigue puliendo su juego. Los jugadores de PS5 y Xbox Series X/S notarán una mejora significativa en la tasa de frames y en los tiempos de carga.</p>' },
        { id: '1', title: 'El nuevo RPG que revoluciona el género llega en 2025', tag: 'LANZAMIENTO', summary: 'Tras años de desarrollo, el estudio independiente "Pixel Nomads" lanza su ópera prima, un juego que promete...', imageCard: 'https://placehold.co/800x450/1F2937/FFFFFF?text=RPG+Destacado', imageHeader: 'https://placehold.co/1200x500/111827/FFFFFF?text=RPG+Revolucionario', content: `<p>Tras años de desarrollo, el estudio independiente "Pixel Nomads" lanza su ópera prima. Ya hemos jugado las primeras horas y las sensaciones no podrían ser mejores.</p><h2>Un mundo vivo</h2><p>El mundo abierto no es solo un escenario, sino un personaje más. Las decisiones que tomamos tienen consecuencias visibles.</p>` }
    ];
    const guides = [
        { id: 'g1', title: 'Guía de Crafteo: Los 10 items que no pueden faltar', game: 'Survival Evolved', image: 'https://placehold.co/400x300/1F2937/FFFFFF?text=Guía+Survival', content: '<p>Domina el arte de la supervivencia con esta guía esencial. Te mostraremos los 10 objetos clave que debes fabricar cuanto antes.</p>' },
        { id: 'g2', title: 'Mejores builds para Elden Ring', game: 'Elden Ring', image: 'https://placehold.co/400x300/1F2937/FFFFFF?text=Guía+Elden+Ring', content: '<p>Destroza a cualquier jefe con estas configuraciones de personaje optimizadas para el endgame.</p>' },
        { id: 'g3', title: 'Mapa interactivo de Helldivers 2', game: 'Helldivers 2', image: 'https://placehold.co/400x300/1F2937/FFFFFF?text=Guía+Helldivers', content: '<p>Encuentra todas las localizaciones de supercréditos y muestras raras con nuestro mapa interactivo actualizado.</p>' }
    ];
    const contentDB = [...articles, ...guides].reduce((acc, item) => ({ ...acc, [item.id]: item }), {});

    // --- ESTADO DE LA APLICACIÓN ---
    let lastActivePage = 'home-page';
    let currentPage = 1;
    let articlesPerPage = 3;
    let currentFilter = 'All';

    // --- LÓGICA DE NAVEGACIÓN Y RENDERIZADO ---
    const pages = document.querySelectorAll('.page');
    function showPage(pageId) {
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

    // --- MANEJO DE EVENTOS PRINCIPAL ---
    renderTags();
    renderNews();
    renderGuides();

    document.getElementById('home-link').addEventListener('click', (e) => { e.preventDefault(); showPage('home-page'); });
    document.getElementById('news-link').addEventListener('click', (e) => { e.preventDefault(); showPage('home-page'); });
    document.getElementById('guides-link').addEventListener('click', (e) => { e.preventDefault(); showPage('guides-page'); });
    document.getElementById('giveaway-link').addEventListener('click', (e) => { e.preventDefault(); showPage('giveaway-page'); });
    document.getElementById('community-link').addEventListener('click', (e) => { e.preventDefault(); showPage('community-page'); });
    document.getElementById('back-button').addEventListener('click', () => showPage(lastActivePage));
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

    // --- INICIALIZACIÓN DE LA HERRAMIENTA DE SORTEOS ---
    initializeGiveawayTool();
});


// --- LÓGICA DE LA HERRAMIENTA DE SORTEOS (Encapsulada) ---
function initializeGiveawayTool() {
    // --- Elementos del DOM ---
    const giveawayPage = document.getElementById('giveaway-page');
    if (!giveawayPage) return; // No ejecutar si no estamos en la página de sorteos

    const mainTitle = giveawayPage.querySelector('#main-title');
    const giveawayTitleInput = giveawayPage.querySelector('#giveaway-title-input');
    const participantInput = giveawayPage.querySelector('#participant-input');
    const addParticipantBtn = giveawayPage.querySelector('#add-participant-btn');
    const bulkImportInput = giveawayPage.querySelector('#bulk-import-input');
    const importBtn = giveawayPage.querySelector('#import-btn');
    const participantsList = giveawayPage.querySelector('#participants-list');
    const participantCountEl = giveawayPage.querySelector('#participant-count');
    const emptyListMsg = giveawayPage.querySelector('#empty-list-msg');
    const participantSetupWrapper = giveawayPage.querySelector('#participant-setup-wrapper');
    const participantListWrapper = giveawayPage.querySelector('#participant-list-wrapper');
    const prizeSetupWrapper = giveawayPage.querySelector('#prize-setup-wrapper');
    const prizeNameInput = giveawayPage.querySelector('#prize-name-input');
    const prizeProbInput = giveawayPage.querySelector('#prize-prob-input');
    const addPrizeBtn = giveawayPage.querySelector('#add-prize-btn');
    const prizeListEl = giveawayPage.querySelector('#prize-list');
    const emptyPrizeMsg = giveawayPage.querySelector('#empty-prize-msg');
    const totalProbEl = giveawayPage.querySelector('#total-prob');
    const completeProbBtn = giveawayPage.querySelector('#complete-prob-btn');
    const drawWinnerBtn = giveawayPage.querySelector('#draw-winner-btn');
    const winnerCountInput = giveawayPage.querySelector('#winner-count');
    const winnerCountWrapper = giveawayPage.querySelector('#winner-count-wrapper');
    const teamSizeInput = giveawayPage.querySelector('#team-size');
    const teamSizeWrapper = giveawayPage.querySelector('#team-size-wrapper');
    const gameModeRadios = giveawayPage.querySelectorAll('input[name="game-mode"]');
    const setupContainer = giveawayPage.querySelector('#setup-container');
    const resultSection = giveawayPage.querySelector('#result-section');
    const resultTitle = giveawayPage.querySelector('#result-title');
    const rouletteWrapper = giveawayPage.querySelector('#roulette-wrapper');
    const rouletteReel = giveawayPage.querySelector('#roulette-reel');
    const prizeWheelContainer = giveawayPage.querySelector('#prize-wheel-container');
    const prizeWheel = giveawayPage.querySelector('#prize-wheel');
    const winnerDisplay = giveawayPage.querySelector('#winner-display');
    const winnerList = giveawayPage.querySelector('#winner-list');
    const nextRoundBtn = giveawayPage.querySelector('#next-round-btn');
    const exportBtn = giveawayPage.querySelector('#export-btn');
    const resetBtn = giveawayPage.querySelector('#reset-btn');
    const notificationModal = document.getElementById('notification-modal');
    const notificationMessage = document.getElementById('notification-message');
    const notificationCloseBtn = document.getElementById('notification-close-btn');

    // --- Estado de la aplicación ---
    let participants = [];
    let originalParticipants = [];
    let winners = [];
    let prizes = [];
    let generatedTeams = [];
    let tournamentData = { rounds: [], currentRound: 0 };
    let isSpinning = false;
    let gameMode = 'classic';
    let tickSynth = null;
    let winSynth = null;

    // --- Funciones del Modal y Notificaciones ---
    const showNotification = (message) => {
        notificationMessage.textContent = message;
        notificationModal.classList.remove('hidden');
    };
    const closeNotification = () => notificationModal.classList.add('hidden');

    // --- Sonidos ---
    const initializeSynths = () => {
        if (tickSynth || typeof Tone === 'undefined') return;
        try {
            tickSynth = new Tone.MembraneSynth({ octaves: 4, pitchDecay: 0.1, envelope: { attack: 0.001, decay: 0.2, sustain: 0 }, }).toDestination();
            winSynth = new Tone.PolySynth(Tone.Synth, { envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.5 }, }).toDestination();
        } catch (e) { console.error("Error al inicializar Tone.js:", e); tickSynth = null; winSynth = null; }
    };
    const playTickSound = () => tickSynth?.triggerAttackRelease("C2", "8n", Tone.now());
    const playWinSound = () => {
        if (!winSynth) return;
        const now = Tone.now();
        winSynth.triggerAttackRelease(["C4", "E4", "G4"], "8n", now);
        winSynth.triggerAttackRelease(["G4", "B4", "D5"], "8n", now + 0.2);
        winSynth.triggerAttackRelease(["C5", "E5", "G5"], "4n", now + 0.4);
    };

    // --- Lógica de Participantes y Premios ---
    const updateParticipantsUI = () => {
        participantsList.innerHTML = '';
        if (participants.length === 0) {
            participantsList.appendChild(emptyListMsg);
            emptyListMsg.style.display = 'block';
        } else {
            emptyListMsg.style.display = 'none';
            participants.forEach((p, i) => {
                const el = document.createElement('div');
                el.className = 'flex justify-between items-center bg-gray-800 p-2 rounded-md mb-2 shadow-sm';
                el.innerHTML = `<span class="text-gray-300">${p}</span><button data-index="${i}" class="remove-btn text-red-500 hover:text-red-400 text-2xl font-bold leading-none">&times;</button>`;
                participantsList.appendChild(el);
            });
        }
        participantCountEl.textContent = participants.length;
        updateDrawButtonState();
    };

    const addParticipant = () => {
        const name = participantInput.value.trim();
        if (name && !isSpinning) {
            if (participants.includes(name)) {
                showNotification('Este participante ya está en la lista.');
                return;
            }
            participants.push(name);
            participantInput.value = '';
            updateParticipantsUI();
        }
        participantInput.focus();
    };

    const importParticipants = () => {
        const namesText = bulkImportInput.value.trim();
        if (!namesText) return;
        const names = namesText.split('\n').map(n => n.trim()).filter(n => n.length > 0);
        let newCount = 0;
        names.forEach(name => {
            if (!participants.includes(name)) {
                participants.push(name);
                newCount++;
            }
        });
        bulkImportInput.value = '';
        updateParticipantsUI();
        showNotification(`${newCount} nuevo(s) participante(s) agregado(s).`);
    };

    const removeParticipant = (index) => {
        if (!isSpinning) {
            participants.splice(index, 1);
            updateParticipantsUI();
        }
    };
    
    const updatePrizesUI = () => {
        prizeListEl.innerHTML = '';
        let totalProb = 0;
        if (prizes.length === 0) {
            prizeListEl.appendChild(emptyPrizeMsg);
            emptyPrizeMsg.style.display = 'block';
        } else {
            emptyPrizeMsg.style.display = 'none';
            prizes.forEach((p, i) => {
                const el = document.createElement('div');
                el.className = 'flex justify-between items-center bg-gray-800 p-2 rounded-md mb-2 shadow-sm';
                el.innerHTML = `<span class="text-gray-300">${p.name}</span><span class="font-semibold text-indigo-400">${p.probability}%</span><button data-index="${i}" class="remove-prize-btn text-red-500 hover:text-red-400 text-2xl font-bold leading-none">&times;</button>`;
                prizeListEl.appendChild(el);
                totalProb += p.probability;
            });
        }
        totalProbEl.textContent = totalProb.toFixed(2);
        totalProbEl.classList.toggle('text-green-400', Math.abs(totalProb - 100) < 0.01);
        totalProbEl.classList.toggle('text-red-400', Math.abs(totalProb - 100) >= 0.01);
        drawPrizeWheel();
        updateDrawButtonState();
    };

    const addPrize = () => {
        const name = prizeNameInput.value.trim();
        const prob = parseFloat(prizeProbInput.value);
        if (!name || isNaN(prob) || prob <= 0) {
            showNotification('Por favor, ingresa un nombre y una probabilidad válida para el premio.');
            return;
        }
        prizes.push({ name, probability: prob });
        prizeNameInput.value = '';
        prizeProbInput.value = '';
        updatePrizesUI();
    };

    const removePrize = (index) => {
        prizes.splice(index, 1);
        updatePrizesUI();
    };
    
    const completeProbability = () => {
        const totalProb = prizes.reduce((sum, p) => sum + p.probability, 0);
        if (totalProb >= 100) {
            showNotification('La probabilidad ya es 100% o más.');
            return;
        }
        const remainingProb = parseFloat((100 - totalProb).toFixed(2));
        const existingNoWinIndex = prizes.findIndex(p => p.name.toLowerCase() === 'suerte para la próxima');
        if (existingNoWinIndex !== -1) {
            prizes[existingNoWinIndex].probability += remainingProb;
        } else {
            prizes.push({ name: 'Suerte para la próxima', probability: remainingProb });
        }
        updatePrizesUI();
    };

    const drawPrizeWheel = () => {
        prizeWheel.innerHTML = '';
        prizeWheel.style.transform = 'rotate(0deg)';
        if (prizes.length === 0) {
            prizeWheel.style.background = '#374151';
            return;
        }
        const colors = ['#8b5cf6', '#ec4899', '#22d3ee', '#fde047', '#34d399', '#f97316'];
        let gradientString = 'conic-gradient(';
        let currentAngle = 0;
        const totalProb = prizes.reduce((sum, p) => sum + p.probability, 0);
        if (totalProb === 0) return;

        prizes.forEach((prize, i) => {
            const angle = (prize.probability / totalProb) * 360;
            gradientString += `${colors[i % colors.length]} ${currentAngle}deg ${currentAngle + angle}deg, `;
            const labelAngle = currentAngle + (angle / 2);
            const label = document.createElement('div');
            label.className = 'prize-segment-label';
            label.textContent = prize.name;
            label.style.transform = `rotate(${labelAngle}deg) translate(20%)`;
            prizeWheel.appendChild(label);
            currentAngle += angle;
        });
        
        prizeWheel.style.background = gradientString.slice(0, -2) + ')';
    };

    const updateDrawButtonState = () => {
        let minParticipants = 2;
        let enabled = false;
        if (gameMode === 'classic') {
            minParticipants = parseInt(winnerCountInput.value, 10);
            enabled = participants.length >= minParticipants;
        } else if (gameMode === 'elimination' || gameMode === 'tournament') {
            enabled = participants.length >= 2;
        } else if (gameMode === 'teams') {
            minParticipants = parseInt(teamSizeInput.value, 10);
            enabled = participants.length >= minParticipants;
        } else if (gameMode === 'prize') {
            const totalProb = prizes.reduce((sum, p) => sum + p.probability, 0);
            enabled = prizes.length > 0 && Math.abs(totalProb - 100) < 0.01;
        }
        drawWinnerBtn.disabled = !enabled;
    };

    // --- Lógica del Sorteo ---
    const handleDraw = async () => {
        if (isSpinning) return;
        isSpinning = true;
        if (typeof Tone !== 'undefined') { await Tone.start(); initializeSynths(); }
        setupContainer.classList.add('hidden');
        resultSection.classList.remove('hidden');
        originalParticipants = [...participants];
        if (gameMode === 'classic') drawClassicMode();
        else if (gameMode === 'elimination') drawEliminationMode();
        else if (gameMode === 'tournament') drawTournamentMode();
        else if (gameMode === 'teams') drawTeamsMode();
        else if (gameMode === 'prize') drawPrizeMode();
    };

    const drawPrizeMode = () => {
        prizeWheelContainer.classList.remove('hidden');
        rouletteWrapper.classList.add('hidden');
        const random = Math.random() * 100;
        let cumulativeProb = 0;
        let winningPrize = prizes[prizes.length - 1]; 
        let winningPrizeIndex = -1;
        let cumulativeAngle = 0;
        let targetAngle = 0;

        for (let i = 0; i < prizes.length; i++) {
            const angle = (prizes[i].probability / 100) * 360;
            if (random < cumulativeProb + prizes[i].probability) {
                winningPrize = prizes[i];
                winningPrizeIndex = i;
                targetAngle = cumulativeAngle + (Math.random() * angle);
                break;
            }
            cumulativeProb += prizes[i].probability;
            cumulativeAngle += angle;
        }
        
        prizeWheel.style.transition = 'none';
        prizeWheel.style.transform = 'rotate(0deg)';
        prizeWheel.getBoundingClientRect(); 
        const finalRotation = (5 * 360) + 360 - targetAngle;
        prizeWheel.style.transition = 'transform 8s cubic-bezier(0.25, 0.1, 0.5, 1)';
        prizeWheel.style.transform = `rotate(${finalRotation}deg)`;

        setTimeout(() => {
            playWinSound();
            const isRealPrize = winningPrize.name.toLowerCase() !== 'suerte para la próxima';
            announceWinners([winningPrize.name], false, '🎁 ¡Resultado del Sorteo! 🎁');
            if (isRealPrize && typeof confetti === 'function') {
                confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
            }
            exportBtn.classList.add('hidden');
        }, 8100);
    };

    const drawClassicMode = () => {
        const numWinners = parseInt(winnerCountInput.value, 10);
        if (participants.length < numWinners) {
            showNotification('No hay suficientes participantes.');
            resetToSetup(); return;
        }
        let potentialWinners = [...participants];
        winners = [];
        for (let i = 0; i < numWinners; i++) {
            winners.push(potentialWinners.splice(Math.floor(Math.random() * potentialWinners.length), 1)[0]);
        }
        rouletteWrapper.classList.remove('hidden');
        startRoulette(winners[0], `¡La ruleta gira para encontrar al ganador!`, () => announceWinners(winners));
    };
    
    const drawEliminationMode = () => {
        if (participants.length <= 1) return;
        const loser = participants[Math.floor(Math.random() * participants.length)];
        rouletteWrapper.classList.remove('hidden');
        startRoulette(loser, `Eliminando a un participante...`, () => {
            participants = participants.filter(p => p !== loser);
            updateParticipantsUI();
            resultTitle.textContent = `💥 ¡${loser} ha sido eliminado! �`;
            winnerDisplay.innerHTML = `<p class="text-lg text-gray-400">${participants.length} participante(s) restante(s).</p>`;
            winnerDisplay.classList.remove('hidden');
            if (participants.length === 1) {
                winners = [...participants];
                announceWinners(winners, true);
            } else {
                nextRoundBtn.classList.remove('hidden');
                nextRoundBtn.textContent = 'Siguiente Ronda de Eliminación';
            }
        });
    };

    const drawTournamentMode = () => {
        let shuffled = [...participants].sort(() => 0.5 - Math.random());
        let firstRoundMatches = [];
        let bye = null;
        if (shuffled.length % 2 !== 0) { bye = shuffled.pop(); }
        for (let i = 0; i < shuffled.length; i += 2) {
            firstRoundMatches.push({ pair: [shuffled[i], shuffled[i+1]], winner: null });
        }
        if (bye) { firstRoundMatches.push({ pair: [bye], winner: bye }); }
        tournamentData.rounds.push({ matches: firstRoundMatches });
        displayCurrentTournamentRound();
    };
    
    const drawTeamsMode = () => {
        const size = parseInt(teamSizeInput.value, 10);
        if (participants.length < size) {
            showNotification('No hay suficientes participantes para formar ni un solo equipo.');
            resetToSetup(); return;
        }
        let shuffled = [...participants].sort(() => 0.5 - Math.random());
        generatedTeams = [];
        while(shuffled.length > 0) {
            generatedTeams.push(shuffled.splice(0, size));
        }
        displayTeams();
    };

    const displayTeams = () => {
        resultTitle.textContent = "👥 ¡Equipos Generados! 👥";
        rouletteWrapper.classList.add('hidden');
        winnerList.innerHTML = '';
        generatedTeams.forEach((team, index) => {
            const teamWrapper = document.createElement('div');
            teamWrapper.className = 'bg-gray-700 p-4 rounded-lg mb-3';
            const teamTitle = document.createElement('h3');
            teamTitle.className = 'text-xl font-bold text-indigo-400 mb-2';
            teamTitle.textContent = `Equipo ${index + 1}`;
            teamWrapper.appendChild(teamTitle);
            const membersList = document.createElement('ul');
            membersList.className = 'list-disc list-inside text-left';
            team.forEach(member => {
                const memberEl = document.createElement('li');
                memberEl.className = 'text-gray-300';
                memberEl.textContent = member;
                membersList.appendChild(memberEl);
            });
            teamWrapper.appendChild(membersList);
            winnerList.appendChild(teamWrapper);
        });
        winnerDisplay.classList.remove('hidden');
        exportBtn.classList.remove('hidden');
    };
    
    const displayCurrentTournamentRound = () => {
        const currentRoundIndex = tournamentData.currentRound;
        const round = tournamentData.rounds[currentRoundIndex];
        resultTitle.textContent = `⚔️ Ronda ${currentRoundIndex + 1} ⚔️`;
        rouletteWrapper.classList.add('hidden');
        winnerList.innerHTML = '';
        nextRoundBtn.classList.add('hidden');
        round.matches.forEach((match, matchIndex) => {
            const pairEl = document.createElement('div');
            pairEl.className = 'bg-gray-700 p-4 rounded-lg mb-3 text-lg';
            if (match.pair.length === 2) {
                pairEl.innerHTML = `<span class="match-participant font-semibold text-indigo-400" data-match="${matchIndex}" data-player="${match.pair[0]}">${match.pair[0]}</span> <span class="text-gray-400">vs</span> <span class="match-participant font-semibold text-teal-400" data-match="${matchIndex}" data-player="${match.pair[1]}">${match.pair[1]}</span>`;
            } else {
                pairEl.innerHTML = `<span class="font-semibold text-yellow-400">${match.pair[0]}</span> <span class="text-gray-400">(Avanza)</span>`;
            }
            winnerList.appendChild(pairEl);
        });
        winnerDisplay.classList.remove('hidden');
        exportBtn.classList.remove('hidden');
        document.querySelectorAll('.match-participant').forEach(el => {
            el.addEventListener('click', handleWinnerSelection);
        });
    };
    
    const handleWinnerSelection = (e) => {
        const target = e.target;
        const matchIndex = parseInt(target.dataset.match, 10);
        const winnerName = target.dataset.player;
        const currentRound = tournamentData.rounds[tournamentData.currentRound];
        currentRound.matches[matchIndex].winner = winnerName;
        const matchContainer = target.parentElement;
        matchContainer.querySelectorAll('.match-participant').forEach(el => {
            el.classList.remove('match-winner', 'match-loser');
            if(el.dataset.player === winnerName) {
                el.classList.add('match-winner');
            } else {
                el.classList.add('match-loser');
            }
        });
        checkIfRoundIsComplete();
    };
    
    const checkIfRoundIsComplete = () => {
        const currentRound = tournamentData.rounds[tournamentData.currentRound];
        const allWinnersSelected = currentRound.matches.every(match => match.winner !== null);
        if (allWinnersSelected) {
            const winnersOfThisRound = currentRound.matches.map(match => match.winner);
            if (winnersOfThisRound.length === 1) {
                winners = winnersOfThisRound;
                announceWinners(winners, true);
            } else {
                nextRoundBtn.classList.remove('hidden');
                nextRoundBtn.textContent = 'Generar Siguiente Ronda';
            }
        }
    };
    
    const generateNextTournamentRound = () => {
        const lastRound = tournamentData.rounds[tournamentData.currentRound];
        const roundWinners = lastRound.matches.map(match => match.winner);
        let shuffled = [...roundWinners].sort(() => 0.5 - Math.random());
        let nextRoundMatches = [];
        let bye = null;
        if (shuffled.length % 2 !== 0) { bye = shuffled.pop(); }
        for (let i = 0; i < shuffled.length; i += 2) {
            nextRoundMatches.push({ pair: [shuffled[i], shuffled[i+1]], winner: null });
        }
        if (bye) { nextRoundMatches.push({ pair: [bye], winner: bye }); }
        tournamentData.currentRound++;
        tournamentData.rounds.push({ matches: nextRoundMatches });
        displayCurrentTournamentRound();
    };

    const startRoulette = (target, title, onComplete) => {
        resultTitle.textContent = title;
        winnerDisplay.classList.add('hidden');
        nextRoundBtn.classList.add('hidden');
        exportBtn.classList.add('hidden');
        rouletteReel.innerHTML = '';
        rouletteReel.style.transition = 'none';
        rouletteReel.style.transform = 'translateY(0)';
        
        const reelItems = [];
        const sourceList = originalParticipants.length > 1 ? originalParticipants : [target, target, target];
        const reelLength = Math.max(30, participants.length); 
        const targetPositionIndex = Math.floor(reelLength * 0.85);
        for (let i = 0; i < reelLength; i++) {
            reelItems.push(sourceList[Math.floor(Math.random() * sourceList.length)]);
        }
        reelItems.splice(targetPositionIndex, 0, target);
        reelItems.forEach(name => {
            const itemEl = document.createElement('div');
            itemEl.className = 'roulette-item';
            itemEl.textContent = name;
            rouletteReel.appendChild(itemEl);
        });
        const tickInterval = setInterval(playTickSound, 150);
        const baseDuration = 5;
        const extraDurationPerParticipant = 0.05;
        const duration = baseDuration + (participants.length * extraDurationPerParticipant);
        setTimeout(() => {
            rouletteReel.style.transition = `transform ${duration}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
            const targetPosition = targetPositionIndex * 100;
            rouletteReel.style.transform = `translateY(-${targetPosition}px)`;
        }, 100);
        setTimeout(() => {
            clearInterval(tickInterval);
            playWinSound();
            onComplete();
        }, duration * 1000 + 100);
    };

    const announceWinners = (finalWinners, isChampion = false, customTitle = null) => {
        const titleText = customTitle || (isChampion ? '🏆 ¡Tenemos un Campeón! 🏆' : (finalWinners.length > 1 ? '🏆 ¡Y los ganadores son! 🏆' : '🏆 ¡El ganador es! 🏆'));
        resultTitle.textContent = titleText;
        winnerList.innerHTML = '';
        winnerDisplay.classList.remove('hidden');
        winnerDisplay.appendChild(winnerList);
        nextRoundBtn.classList.add('hidden');
        finalWinners.forEach((w, index) => {
            setTimeout(() => {
                const winnerEl = document.createElement('p');
                winnerEl.className = 'text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 py-3 px-4 winner-animation';
                winnerEl.textContent = w;
                winnerList.appendChild(winnerEl);
                if (typeof confetti === 'function' && w.toLowerCase() !== 'suerte para la próxima') {
                   confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
                }
            }, index * 600);
        });
        exportBtn.classList.remove('hidden');
    };

    const exportResults = () => {
        const date = new Date().toLocaleString('es-ES');
        let content = `--- Resultados del Sorteo ---\n`;
        content += `Título: ${giveawayTitleInput.value || 'Sorteo sin título'}\n`;
        content += `Fecha: ${date}\n`;
        content += `Modo: ${gameMode}\n\n`;
        if(gameMode !== 'prize') {
            content += `--- Participantes (${originalParticipants.length}) ---\n`;
            originalParticipants.forEach(p => content += `- ${p}\n`);
        }
        if (gameMode === 'tournament') {
            content += `\n--- Desarrollo del Torneo ---\n`;
            tournamentData.rounds.forEach((round, roundIndex) => {
                content += `\n--- Ronda ${roundIndex + 1} ---\n`;
                round.matches.forEach(match => {
                    if (match.pair.length === 2) {
                        content += `${match.pair[0]} vs ${match.pair[1]} => Ganador: ${match.winner || 'Pendiente'}\n`;
                    } else {
                        content += `${match.pair[0]} avanza directamente.\n`;
                    }
                });
            });
             if(winners.length > 0) {
                content += `\n--- 🏆 CAMPEÓN: ${winners[0]} ---\n`;
            }
        } else if (gameMode === 'teams') {
            content += `\n--- Equipos Generados ---\n`;
            generatedTeams.forEach((team, index) => {
                content += `\n--- Equipo ${index + 1} ---\n`;
                team.forEach(member => content += `- ${member}\n`);
            });
        } else if (gameMode !== 'prize') {
            content += `\n--- Ganador(es) ---\n`;
            winners.forEach(w => content += `🏆 ${w}\n`);
        }
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = 'resultados-sorteo.txt';
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const handleGameModeChange = (e) => {
        gameMode = e.target.value;
        winnerCountWrapper.style.display = gameMode === 'classic' ? 'flex' : 'none';
        teamSizeWrapper.style.display = gameMode === 'teams' ? 'flex' : 'none';
        participantSetupWrapper.style.display = gameMode === 'prize' ? 'none' : 'block';
        participantListWrapper.style.display = gameMode === 'prize' ? 'none' : 'block';
        prizeSetupWrapper.style.display = gameMode === 'prize' ? 'block' : 'none';
        let buttonText = '¡Comenzar!';
        if (gameMode === 'classic' || gameMode === 'elimination') buttonText = '¡Girar la Ruleta!';
        if (gameMode === 'tournament') buttonText = 'Crear Llaves';
        if (gameMode === 'teams') buttonText = 'Crear Equipos';
        if (gameMode === 'prize') buttonText = '¡Girar la Rueda de Premios!';
        drawWinnerBtn.textContent = buttonText;
        updateDrawButtonState();
    };

    // --- Funciones de control ---
    const resetToSetup = () => {
        isSpinning = false;
        resultSection.classList.add('hidden');
        setupContainer.classList.remove('hidden');

        exportBtn.classList.add('hidden');
        nextRoundBtn.classList.add('hidden');
        rouletteWrapper.classList.remove('hidden');
        prizeWheelContainer.classList.add('hidden');
        participantInput.focus();
    };

    const resetApp = () => {
        participants = [];
        originalParticipants = [];
        winners = [];
        prizes = [];
        generatedTeams = [];
        tournamentData = { rounds: [], currentRound: 0 };
        updateParticipantsUI();
        updatePrizesUI();
        resetToSetup();
        winnerCountInput.value = 1;
        teamSizeInput.value = 2;
        giveawayTitleInput.value = '';
        mainTitle.textContent = 'Sorteos Nómadas';
    };

    // --- Event Listeners ---
    giveawayTitleInput.addEventListener('input', (e) => {
        if(e.target.value.trim()){
            mainTitle.textContent = e.target.value.trim();
        } else {
            mainTitle.textContent = 'Sorteos Nómadas';
        }
    });
    addParticipantBtn.addEventListener('click', addParticipant);
    participantInput.addEventListener('keydown', (e) => e.key === 'Enter' && addParticipant());
    importBtn.addEventListener('click', importParticipants);
    participantsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) removeParticipant(parseInt(e.target.getAttribute('data-index'), 10));
    });
    addPrizeBtn.addEventListener('click', addPrize);
    prizeListEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-prize-btn')) removePrize(parseInt(e.target.getAttribute('data-index'), 10));
    });
    completeProbBtn.addEventListener('click', completeProbability);
    drawWinnerBtn.addEventListener('click', handleDraw);
    nextRoundBtn.addEventListener('click', () => {
        isSpinning = false;
        if(gameMode === 'elimination') drawEliminationMode();
        if(gameMode === 'tournament') generateNextTournamentRound();
    });
    exportBtn.addEventListener('click', exportResults);
    gameModeRadios.forEach(radio => radio.addEventListener('change', handleGameModeChange));
    resetBtn.addEventListener('click', resetApp);
    notificationCloseBtn.addEventListener('click', closeNotification);

    // Inicializar UI
    updateParticipantsUI();
    updatePrizesUI();
}