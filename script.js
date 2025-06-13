// Константы
const WORDS_PER_MINUTE = 200;

// DOM элементы
const newsContainer = document.getElementById('newsContainer');
const mostPopularContainer = document.getElementById('mostPopular');
const sortSelect = document.getElementById('sortSelect');
const themeToggle = document.getElementById('themeToggle');
const categoryFilters = document.getElementById('categoryFilters');
const navbarBrand = document.querySelector('.site-title');

// Поросячий режим
const pigModeToggle = document.getElementById('pigModeToggle');
const pigSound = new Audio('pub/drujelyubnoe-hryukane-molodoy-svinki.mp3');

// Режим демократии
const democracyModeToggle = document.getElementById('democracyModeToggle');
const democracyVolumeControl = document.querySelector('.democracy-volume-control');
const democracyVolumeBtn = document.getElementById('democracyVolumeBtn');
const democracyVolume = document.getElementById('democracyVolume');
const eagleSound = new Audio('pub/eagle-281163.mp3');
const anthemSound = new Audio('pub/the_star-spangled_banner_-_u_s.mp3');
const gunSound = new Audio('pub/avtomatnyie-pulemetnyie-ocheredi-27911.mp3');

// Состояние приложения
let articles = [];
let currentTheme = localStorage.getItem('theme') || 'light';
let selectedCategory = 'all';
let isPigMode = false;
let isDemocracyMode = false;

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    await loadArticles();
    applyTheme();
    renderCategoryFilters();
    renderArticles();
    updateMostPopular();
    
    // Добавляем обработчик клика на название сайта
    navbarBrand.addEventListener('click', function(e) {
        e.preventDefault();
        selectedCategory = 'all';
        sortSelect.value = 'date';
        document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
        document.querySelector('.category-filter[data-category="all"]').classList.add('active');
        renderArticles();
    });
});

// Загрузка статей
async function loadArticles() {
    try {
        const response = await fetch('Articles.json');
        const data = await response.json();
        articles = data.articles;
    } catch (error) {
        console.error('Ошибка загрузки статей:', error);
        newsContainer.innerHTML = '<div class="col-12"><div class="alert alert-danger">Ошибка загрузки статей. Пожалуйста, попробуйте позже.</div></div>';
    }
}

// Расчет времени чтения
function calculateReadingTime(wordCount) {
    const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
    return `${minutes} мин`;
}

// Рендеринг фильтров категорий
function renderCategoryFilters() {
    const categories = [...new Set(articles.map(article => article.category))];
    const categoryCounts = categories.reduce((acc, category) => {
        acc[category] = articles.filter(article => article.category === category).length;
        return acc;
    }, {});

    categoryFilters.innerHTML = `
        <div class="category-filter ${selectedCategory === 'all' ? 'active' : ''}" data-category="all">
            Все категории
            <span class="badge">${articles.length}</span>
        </div>
        ${categories.map(category => `
            <div class="category-filter ${selectedCategory === category ? 'active' : ''}" data-category="${category}">
                ${category}
                <span class="badge">${categoryCounts[category]}</span>
            </div>
        `).join('')}
    `;

    // Добавляем обработчики событий
    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.addEventListener('click', () => {
            if (isPigMode) {
                pigSound.currentTime = 0;
                pigSound.play();
            } else if (isDemocracyMode) {
                eagleSound.currentTime = 0;
                gunSound.currentTime = 0;
                eagleSound.play();
                gunSound.play();
            }
            selectedCategory = filter.dataset.category;
            document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            renderArticles();
        });
    });
}

// Рендеринг статей
function renderArticles() {
    let filteredArticles = articles;
    
    // Фильтрация по категории
    if (selectedCategory !== 'all') {
        filteredArticles = articles.filter(article => article.category === selectedCategory);
    }

    // Сортировка
    const sortedArticles = [...filteredArticles].sort((a, b) => {
        if (sortSelect.value === 'date') {
            return new Date(b.date) - new Date(a.date);
        }
        return b.views - a.views;
    });

    if (sortedArticles.length === 0) {
        newsContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">Нет статей в выбранной категории.</div></div>';
        return;
    }

    newsContainer.innerHTML = sortedArticles.map(article => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card news-card h-100">
                <div class="card-body">
                    <span class="badge bg-primary category-badge">${article.category}</span>
                    <h5 class="card-title mt-2">${article.title}</h5>
                    <p class="card-text">${article.content.substring(0, 150)}...</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <div>
                            <span class="reading-time">⏱️ ${calculateReadingTime(article.wordCount)}</span>
                            <span class="views-count ms-3">👁️ ${article.views}</span>
                        </div>
                        <small class="text-muted">${formatDate(article.date)}</small>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Форматирование даты
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

// Обновление самого популярного
function updateMostPopular() {
    const mostPopular = articles.reduce((max, article) => 
        article.views > max.views ? article : max
    , articles[0]);

    mostPopularContainer.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h6 class="card-title">${mostPopular.title}</h6>
                <p class="card-text small text-muted mb-2">${mostPopular.content.substring(0, 100)}...</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-primary">${mostPopular.category}</span>
                    <small class="text-muted">${formatDate(mostPopular.date)}</small>
                </div>
                <div class="mt-2">
                    <span class="reading-time">⏱️ ${calculateReadingTime(mostPopular.wordCount)}</span>
                    <span class="views-count ms-3">👁️ ${mostPopular.views}</span>
                </div>
            </div>
        </div>
    `;
}

// Переключение темы
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme();
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.innerHTML = currentTheme === 'light' 
        ? '<i class="bi bi-moon-fill"></i> Стать Черноснежкой'
        : '<i class="bi bi-sun-fill"></i> Стать Белоснежкой';
}

// Обработчики событий
sortSelect.addEventListener('change', renderArticles);
themeToggle.addEventListener('click', toggleTheme);

// Поросячий режим
pigModeToggle.addEventListener('click', () => {
    // Выключаем режим демократии если он был включен
    if (isDemocracyMode) {
        isDemocracyMode = false;
        document.body.classList.remove('democracy-mode');
    }
    
    isPigMode = !isPigMode;
    document.body.classList.toggle('pig-mode');
    document.body.classList.toggle('pig-cursor');
    pigSound.play();
});

// Режим демократии
democracyModeToggle.addEventListener('click', () => {
    // Выключаем поросячий режим если он был включен
    if (isPigMode) {
        isPigMode = false;
        document.body.classList.remove('pig-mode');
        document.body.classList.remove('pig-cursor');
    }
    
    isDemocracyMode = !isDemocracyMode;
    document.body.classList.toggle('democracy-mode');
    democracyVolumeControl.style.display = isDemocracyMode ? 'flex' : 'none';
    
    if (isDemocracyMode) {
        eagleSound.play();
    } else {
        eagleSound.pause();
        eagleSound.currentTime = 0;
        anthemSound.pause();
        anthemSound.currentTime = 0;
        gunSound.pause();
        gunSound.currentTime = 0;
    }
});

// Добавляем звук при клике на кнопки в режиме демократии
document.addEventListener('click', (e) => {
    if (isDemocracyMode && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) {
        if (e.target.id === 'democracyModeToggle' || e.target.closest('#democracyModeToggle')) {
            anthemSound.currentTime = 0;
            anthemSound.play();
        } else {
            gunSound.currentTime = 0;
            gunSound.play();
        }
    }
});

// Установка начальной громкости
eagleSound.volume = 1;
anthemSound.volume = 1;
gunSound.volume = 1;

// Функция случайного изменения громкости
function setRandomVolume() {
    const volume = Math.random(); // случайное число от 0 до 1
    eagleSound.volume = volume;
    anthemSound.volume = volume;
    gunSound.volume = volume;
    
    // Обновляем положение ползунка
    democracyVolume.value = volume * 100;
    
    // Добавляем анимацию кнопки
    democracyVolumeBtn.classList.add('volume-changed');
    setTimeout(() => {
        democracyVolumeBtn.classList.remove('volume-changed');
    }, 500);
}

// Обработчик нажатия на кнопку громкости
democracyVolumeBtn.addEventListener('click', setRandomVolume);

// Обработчик изменения громкости
democracyVolumeBtn.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    eagleSound.volume = volume;
    anthemSound.volume = volume;
    gunSound.volume = volume;
}); 