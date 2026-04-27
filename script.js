/**
 * SPA (Single Page Application) Navigation System
 * Современная навигация для сайта "Лига защитников потребителей"
 * Версия 2.2.0
 */

(function() {
    'use strict';
    
    // =========================================================================
    // КОНФИГУРАЦИЯ И КОНСТАНТЫ
    // =========================================================================
    
    /** @constant {Object} Config - Основная конфигурация приложения */
    const Config = {
        // Валидные страницы для навигации
        validPages: ['home', 'consumer', 'zakon', 'articles', 'about', 'contacts'],
        
        // Брейкпоинт для мобильных устройств (px)
        mobileBreakpoint: 1024,
        
        // Предотвращение кэширования при разработке
        cacheBusting: false,
        
        // Длительность анимаций (ms)
        animationDuration: 300,
        
        // Поведение прокрутки
        scrollBehavior: 'smooth',
        
        // Таймаут для уведомлений (ms)
        notificationTimeout: 5000,
        
        // Префикс для кастомных событий
        eventPrefix: 'spa:'
    };
    
    /** @constant {Object} LawConfig - Конфигурация для страниц законов */
    const LawConfig = {
        // Базовый путь к страницам законов
        basePath: 'pages/laws/',
        
        // Валидные законы (ключи должны совпадать с fileNames)
        validLaws: ['zpp', 'pravila', 'koap', 'zk', 'tk'],
        
        // Расширение файлов
        fileExtension: '.html',
        
        // Соответствие кодов законов и имен файлов
        fileNames: {
            'zpp': 'zakon_zpp.html',
            'pravila': 'pravila.html', // Исправлено: было pravila_prodaz.html
            'koap': 'koap.html',       // Упростил для примера
            'zk': 'zk.html',            // Упростил для примера
            'tk': 'tk.html'             // Упростил для примера
        },
        
        // Человеко-читаемые названия законов
        names: {
            'zpp': 'Закон о защите прав потребителей',
            'pravila': 'Правила продажи товаров',
            'koap': 'КоАП РФ',
            'zk': 'Земельный кодекс РФ',
            'tk': 'Трудовой кодекс РФ'
        }
    };
    
    // =========================================================================
    // ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
    // =========================================================================
    
    /** @type {HTMLElement|null} - Основной контейнер контента */
    let pageContent = null;
    
    /** @type {HTMLElement|null} - Кнопка меню */
    let menuToggle = null;
    
    /** @type {HTMLElement|null} - Боковое меню */
    let sidebar = null;
    
    /** @type {NodeList} - Все ссылки навигации */
    let navLinks = null;
    
    /** @type {NodeList} - Все ссылки с data-page атрибутом */
    let allPageLinks = null;
    
    /** @type {Object} - Состояние приложения */
    const State = {
        currentPage: 'home',
        currentLaw: null,
        isLoading: false,
        homeContent: null,
        isSidebarOpen: false,
        cache: new Map()
    };
    
    // =========================================================================
    // ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
    // =========================================================================
    
    /**
     * Инициализирует SPA приложение
     */
    function init() {
        console.log('🚀 SPA Navigation initialized v2.2.0');
        
        // Получаем DOM элементы
        cacheDOM();
        
        // Проверяем необходимые элементы
        if (!validateDOM()) {
            console.error('❌ Не найдены необходимые DOM элементы');
            fallbackToStandardNavigation();
            return;
        }
        
        setupEventListeners();
        handleInitialUrl();
        injectGlobalStyles();
    }
    
    /**
     * Кэширует DOM элементы
     */
    function cacheDOM() {
        pageContent = document.getElementById('page-content');
        menuToggle = document.getElementById('menuToggle');
        sidebar = document.getElementById('sidebar');
        navLinks = document.querySelectorAll('.nav__link');
        allPageLinks = document.querySelectorAll('[data-page]');
    }
    
    /**
     * Проверяет наличие необходимых DOM элементов
     * @returns {boolean}
     */
    function validateDOM() {
        if (!pageContent) {
            console.error('❌ Элемент #page-content не найден');
            return false;
        }
        return true;
    }
    
    /**
     * Переключает на стандартную навигацию если SPA не работает
     */
    function fallbackToStandardNavigation() {
        console.warn('⚠️ Переключаемся на стандартную навигацию');
        // Здесь можно добавить логику для обычных ссылок
    }
    
    /**
     * Настраивает обработчики событий
     */
    function setupEventListeners() {
        // Бургер-меню
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleSidebar);
            menuToggle.addEventListener('keydown', handleMenuToggleKeydown);
        }
        
        // Навигация по меню
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavigation);
        });
        
        // Дополнительные ссылки на страницы
        allPageLinks.forEach(link => {
            if (!link.classList.contains('nav__link')) {
                link.addEventListener('click', handleNavigation);
            }
        });
        
        // Обработка кнопок браузера "Назад"/"Вперед"
        window.addEventListener('popstate', handleBrowserNavigation);
        
        // Обработка изменения размера окна
        window.addEventListener('resize', handleResize);
        
        // Закрытие меню при клике вне его (для мобильных)
        document.addEventListener('click', handleDocumentClick);
    }
    
    // =========================================================================
    // УПРАВЛЕНИЕ БОКОВЫМ МЕНЮ
    // =========================================================================
    
    /**
     * Обрабатывает клики по документу для закрытия меню
     * @param {MouseEvent} event 
     */
    function handleDocumentClick(event) {
        if (window.innerWidth <= Config.mobileBreakpoint && 
            State.isSidebarOpen && 
            sidebar && 
            !sidebar.contains(event.target) && 
            menuToggle && 
            !menuToggle.contains(event.target)) {
            closeSidebar();
        }
    }
    
    /**
     * Переключает видимость бокового меню
     */
    function toggleSidebar() {
        State.isSidebarOpen = !State.isSidebarOpen;
        
        if (sidebar) {
            sidebar.classList.toggle('sidebar--active', State.isSidebarOpen);
            sidebar.setAttribute('aria-hidden', !State.isSidebarOpen);
        }
        
        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', State.isSidebarOpen);
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = State.isSidebarOpen ? 'fas fa-times' : 'fas fa-bars';
            }
        }
        
        // Управление скроллом на мобильных
        if (window.innerWidth <= Config.mobileBreakpoint) {
            document.body.style.overflow = State.isSidebarOpen ? 'hidden' : '';
        }
    }
    
    /**
     * Закрывает боковое меню
     */
    function closeSidebar() {
        State.isSidebarOpen = false;
        
        if (sidebar) {
            sidebar.classList.remove('sidebar--active');
            sidebar.setAttribute('aria-hidden', 'true');
        }
        
        if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'false');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
            }
        }
        
        // Восстанавливаем скролл
        document.body.style.overflow = '';
    }
    
    /**
     * Обрабатывает нажатие клавиш на кнопке меню
     * @param {KeyboardEvent} event
     */
    function handleMenuToggleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleSidebar();
        }
        
        if (event.key === 'Escape' && State.isSidebarOpen) {
            closeSidebar();
        }
    }
    
    // =========================================================================
    // НАВИГАЦИЯ ПО СТРАНИЦАМ
    // =========================================================================
    
    /**
     * Обрабатывает навигацию по страницам
     * @param {Event} event
     */
    async function handleNavigation(event) {
        event.preventDefault();
        
        // Защита от повторных кликов во время загрузки
        if (State.isLoading) {
            console.log('⏳ Загрузка уже выполняется, игнорируем клик');
            return;
        }
        
        const link = event.currentTarget;
        const page = link.getAttribute('data-page');
        const law = link.getAttribute('data-law');
        
        // Валидация страницы
        if (!page) {
            console.error('❌ Отсутствует атрибут data-page');
            return;
        }
        
        // Проверяем, является ли это страницей закона
        if (page === 'law') {
            if (!law) {
                console.error('❌ Отсутствует атрибут data-law для страницы закона');
                showNotification('Не указан закон для загрузки', 'error');
                return;
            }
            
            if (!LawConfig.validLaws.includes(law)) {
                console.error(`❌ Закон "${law}" не найден`);
                showNotification(`Закон "${LawConfig.names[law] || law}" не найден`, 'error');
                return;
            }
            
            console.log(`📚 Навигация на закон: ${law} (${LawConfig.names[law]})`);
            
            // Загружаем контент закона
            await loadLawContent(law);
            
            // Обновляем активный пункт меню (подсвечиваем "Законы")
            updateActiveNav('zakon');
            
        } else {
            // Обычная навигация по страницам
            if (page === State.currentPage) {
                console.log(`ℹ️ Уже на странице: ${page}`);
                return;
            }
            
            if (!Config.validPages.includes(page)) {
                console.error(`❌ Страница "${page}" не найдена`);
                showNotification(`Страница "${page}" не найдена`, 'error');
                return;
            }
            
            console.log(`🔗 Навигация на страницу: ${page}`);
            
            // Обновляем активный пункт меню
            updateActiveNav(page);
            
            // Загружаем контент страницы
            await loadPageContent(page, true);
        }
        
        // Закрываем меню на мобильных устройствах
        if (window.innerWidth <= Config.mobileBreakpoint) {
            closeSidebar();
        }
    }
    
    /**
     * Обновляет активный пункт навигации
     * @param {string} page
     */
    function updateActiveNav(page) {
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('data-page');
            const isActive = linkPage === page;
            link.classList.toggle('nav__link--active', isActive);
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
    }
    
    /**
     * Обрабатывает навигацию браузера (Назад/Вперед)
     * @param {PopStateEvent} event
     */
    async function handleBrowserNavigation(event) {
        if (event.state) {
            const { page, law } = event.state;
            
            if (page === 'law' && law) {
                console.log(`↩️ Навигация браузера на закон: ${law}`);
                await loadLawContent(law);
                updateActiveNav('zakon');
            } else if (page) {
                console.log(`↩️ Навигация браузера на страницу: ${page}`);
                updateActiveNav(page);
                await loadPageContent(page, false);
            }
        } else {
            // Если нет state, проверяем хэш
            handleInitialUrl();
        }
    }
    
    /**
     * Обрабатывает изменение размера окна
     */
    function handleResize() {
        // Закрываем меню при переходе с мобильного на десктоп
        if (window.innerWidth > Config.mobileBreakpoint && State.isSidebarOpen) {
            closeSidebar();
        }
    }
    
    // =========================================================================
    // ЗАГРУЗКА И ОТОБРАЖЕНИЕ КОНТЕНТА
    // =========================================================================
    
    /**
     * Загружает и отображает контент страницы
     * @param {string} page
     * @param {boolean} updateHistory
     */
    async function loadPageContent(page, updateHistory = true) {
        // Защита от повторных вызовов
        if (State.isLoading) {
            console.log('⏳ Попытка повторной загрузки, игнорируем');
            return;
        }
        
        State.isLoading = true;
        State.currentPage = page;
        State.currentLaw = null;
        
        console.log(`📥 Начинаем загрузку страницы: ${page}`);
        
        try {
            // Показываем индикатор загрузки
            showLoadingIndicator();
            
            // Загружаем контент страницы
            const content = await fetchPageContent(page);
            
            // Кэшируем домашний контент для быстрого доступа
            if (page === 'home' && !State.homeContent) {
                State.homeContent = content;
            }
            
            // Отображаем контент
            displayContent(content);
            
            // Обновляем историю браузера
            if (updateHistory) {
                updateBrowserHistory(page);
            }
            
            // Прокручиваем к началу страницы
            scrollToTop();
            
            console.log(`✅ Страница "${page}" успешно загружена`);
            
        } catch (error) {
            console.error(`❌ Ошибка загрузки страницы "${page}":`, error);
            displayError(error);
            
        } finally {
            // Сбрасываем состояние загрузки
            State.isLoading = false;
            
            // Скрываем индикатор загрузки
            hideLoadingIndicator();
        }
    }
    
    /**
     * Загружает контент конкретного закона
     * @param {string} law 
     */
    async function loadLawContent(law) {
        // Защита от повторных вызовов
        if (State.isLoading) {
            console.log('⏳ Попытка повторной загрузки, игнорируем');
            return;
        }
        
        State.isLoading = true;
        State.currentPage = 'law';
        State.currentLaw = law;
        
        console.log(`📥 Загружаем закон: ${law} (${LawConfig.names[law]})`);
        
        try {
            showLoadingIndicator();
            
            // Загружаем контент закона
            const content = await fetchPageContent('law', law);
            
            // Отображаем контент
            displayContent(content);
            
            // Обновляем историю браузера
            history.pushState({ page: 'law', law }, '', `#law/${law}`);
            
            // Прокручиваем к началу
            scrollToTop();
            
            console.log(`✅ Закон "${law}" успешно загружен`);
            
        } catch (error) {
            console.error(`❌ Ошибка загрузки закона "${law}":`, error);
            displayError(error);
            
        } finally {
            State.isLoading = false;
            hideLoadingIndicator();
        }
    }
    
    /**
     * Загружает HTML контент страницы
     * @param {string} page
     * @param {string|null} law - Название закона (для страниц законов)
     * @returns {Promise<string>}
     */
    async function fetchPageContent(page, law = null) {
        let url;
        let cacheKey;
        
        // Формируем URL и ключ кэша в зависимости от типа страницы
        if (page === 'law' && law) {
            // Используем соответствие имен файлов
            const fileName = LawConfig.fileNames[law];
            if (!fileName) {
                throw new Error(`Не найдено соответствие для закона: ${law}`);
            }
            url = `${LawConfig.basePath}${fileName}`;
            cacheKey = `law:${law}`;
        } else {
            url = `pages/${page}.html`;
            cacheKey = page;
        }
        
        // Добавляем параметр для сброса кэша при необходимости
        if (Config.cacheBusting) {
            url += `?v=${Date.now()}`;
        }
        
        // Проверяем кэш
        if (State.cache.has(cacheKey) && !Config.cacheBusting) {
            console.log(`♻️ Используем кэш для: ${cacheKey}`);
            return State.cache.get(cacheKey);
        }
        
        console.log(`🌐 Запрос к: ${url}`);
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const content = await response.text();
            
            // Проверяем, не пустой ли контент
            if (!content || content.trim() === '') {
                throw new Error('Получен пустой контент');
            }
            
            // Кэшируем
            State.cache.set(cacheKey, content);
            
            return content;
            
        } catch (error) {
            console.error(`❌ Ошибка загрузки ${url}:`, error);
            
            // Возвращаем страницу с ошибкой в зависимости от типа
            if (page === 'law' && law) {
                return getLawErrorPage(law);
            } else {
                throw error;
            }
        }
    }
    
    /**
     * Возвращает HTML страницы с ошибкой для закона
     * @param {string} law 
     * @returns {string}
     */
    function getLawErrorPage(law) {
        const lawName = LawConfig.names[law] || `Закон "${law}"`;
        
        return `
            <div class="error-message" role="alert">
                <div class="error-icon" aria-hidden="true">
                    <i class="fa fa-file-excel-o"></i>
                </div>
                <h2 class="error-title">Закон не найден</h2>
                <div class="error-content">
                    <p>${lawName} временно недоступен или находится в разработке.</p>
                    <p class="error-details">
                        <small>Попробуйте обновить страницу или вернуться позже</small>
                    </p>
                </div>
                <div class="error-actions">
                    <a href="#zakon" class="btn btn--primary" data-page="zakon">
                        <i class="fas fa-arrow-left"></i>
                        Назад к законам
                    </a>
                    <button type="button" class="btn btn--outline" onclick="location.reload()">
                        <i class="fas fa-redo"></i>
                        Обновить
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Отображает загруженный контент
     * @param {string} content
     */
    function displayContent(content) {
        // Вставляем контент
        pageContent.innerHTML = content;
        
        // Добавляем класс для анимации
        pageContent.classList.add('content-loaded');
        
        // Обрабатываем загруженный контент
        processLoadedContent();
        
        // Инициализируем специфичные для страницы компоненты
        initPageComponents();

        // Убираем класс анимации после завершения
        setTimeout(() => {
            pageContent.classList.remove('content-loaded');
        }, Config.animationDuration);
    }
    
    /**
     * Инициализирует компоненты в зависимости от загруженной страницы
     */
    function initPageComponents() {
        if (State.currentPage === 'consumer') {
            console.log('📋 Инициализация FAQ аккордеона для страницы потребителя');
            initFaqAccordion();
        } else if (State.currentPage === 'zakon') {
            console.log('⚖️ Инициализация компонентов для страницы законов');
            initLawPageComponents();
        } else if (State.currentPage === 'articles') {
            console.log('📰 Инициализация компонентов для страницы статей');
            initArticlesComponents();
        } else if (State.currentPage === 'contacts') {
            console.log('📞 Инициализация компонентов для страницы контактов');
            initContactsComponents();
        } else if (State.currentPage === 'about') {
            console.log('ℹ️ Инициализация компонентов для страницы "О нас"');
            initAboutComponents();
        }
    }
    
    /**
     * Инициализирует FAQ аккордеон на странице consumer.html
     */
    function initFaqAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        if (!faqItems.length) {
            console.log('ℹ️ FAQ элементы не найдены на странице');
            return;
        }
        
        console.log(`🔍 Найдено ${faqItems.length} FAQ элементов`);
        
        faqItems.forEach((item, index) => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const toggle = item.querySelector('.faq-toggle');
            
            if (!question || !answer) {
                console.warn(`⚠️ FAQ элемент #${index} имеет неполную структуру`);
                return;
            }
            
            // Добавляем ARIA атрибуты для доступности
            const buttonId = `faq-btn-${index}`;
            const contentId = `faq-content-${index}`;
            
            question.setAttribute('id', buttonId);
            question.setAttribute('aria-controls', contentId);
            question.setAttribute('aria-expanded', 'false');
            question.setAttribute('role', 'button');
            question.setAttribute('tabindex', '0');
            
            answer.setAttribute('id', contentId);
            answer.setAttribute('aria-labelledby', buttonId);
            answer.setAttribute('hidden', '');
            
            // Функция переключения
            const toggleItem = (show) => {
                if (show) {
                    answer.removeAttribute('hidden');
                    question.setAttribute('aria-expanded', 'true');
                    if (toggle) toggle.classList.add('active');
                } else {
                    answer.setAttribute('hidden', '');
                    question.setAttribute('aria-expanded', 'false');
                    if (toggle) toggle.classList.remove('active');
                }
            };
            
            // Обработчик клика
            question.addEventListener('click', (e) => {
                e.preventDefault();
                const isExpanded = question.getAttribute('aria-expanded') === 'true';
                toggleItem(!isExpanded);
            });
            
            // Обработчик клавиатуры
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const isExpanded = question.getAttribute('aria-expanded') === 'true';
                    toggleItem(!isExpanded);
                }
            });
        
                // Все пункты закрыты по умолчанию
                toggleItem(false);
            
        });
        
        console.log('✅ FAQ аккордеон инициализирован');
    }
    
    /**
     * Инициализирует компоненты на странице законов
     */
    function initLawPageComponents() {
        // Подсвечиваем активный закон в списке
        if (State.currentLaw) {
            const lawLinks = document.querySelectorAll('[data-law]');
            lawLinks.forEach(link => {
                const linkLaw = link.getAttribute('data-law');
                const isActive = linkLaw === State.currentLaw;
                link.classList.toggle('law-link--active', isActive);
                link.setAttribute('aria-current', isActive ? 'location' : 'false');
            });
        }
    }
    
    /**
     * Инициализирует компоненты на странице статей
     */
    function initArticlesComponents() {
        // Добавляем обработчики для категорий статей
        const categoryFilters = document.querySelectorAll('.category-filter');
        if (categoryFilters.length) {
            categoryFilters.forEach(filter => {
                filter.addEventListener('click', (e) => {
                    e.preventDefault();
                    const category = filter.getAttribute('data-category');
                    filterArticlesByCategory(category);
                });
            });
        }
    }
    
    /**
     * Фильтрует статьи по категории
     * @param {string} category 
     */
    function filterArticlesByCategory(category) {
        const articles = document.querySelectorAll('.article-card');
        articles.forEach(article => {
            const articleCategory = article.getAttribute('data-category');
            if (category === 'all' || articleCategory === category) {
                article.style.display = 'block';
            } else {
                article.style.display = 'none';
            }
        });
    }
    
    /**
     * Инициализирует компоненты на странице контактов
     */
    function initContactsComponents() {
        // Инициализация карты (если есть)
        initMapIfExists();
        
        // Инициализация формы обратной связи
        initContactForm();
    }
    
    /**
     * Инициализирует карту на странице контактов
     */
    function initMapIfExists() {
        const mapContainer = document.getElementById('map');
        if (mapContainer && typeof ymaps !== 'undefined') {
            ymaps.ready(() => {
                const map = new ymaps.Map('map', {
                    center: [55.76, 37.64],
                    zoom: 10
                });
                console.log('🗺️ Карта инициализирована');
            });
        }
    }
    
    /**
     * Инициализирует форму обратной связи
     */
    function initContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            
            // Простейшая валидация
            if (!data.name || !data.email || !data.message) {
                showNotification('Пожалуйста, заполните все поля', 'warning');
                return;
            }
            
            if (!isValidEmail(data.email)) {
                showNotification('Пожалуйста, введите корректный email', 'warning');
                return;
            }
            
            // Здесь можно добавить отправку на сервер
            console.log('📧 Отправка формы:', data);
            
            // Показываем уведомление об успехе
            showNotification('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.', 'success');
            contactForm.reset();
        });
    }
    
    /**
     * Проверяет валидность email
     * @param {string} email 
     * @returns {boolean}
     */
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    /**
     * Инициализирует компоненты на странице "О нас"
     */
    function initAboutComponents() {
        // Добавляем анимацию для статистики
        animateStatistics();
    }
    
    /**
     * Анимирует счетчики статистики
     */
    function animateStatistics() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target') || stat.textContent, 10);
            if (isNaN(target)) return;
            
            let current = 0;
            const increment = target / 50; // За 50 шагов
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    stat.textContent = target;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.round(current);
                }
            }, 30);
        });
    }
    
    /**
     * Обрабатывает загруженный контент
     */
    function processLoadedContent() {
        // Находим все ссылки с data-page в новом контенте
        const newPageLinks = pageContent.querySelectorAll('[data-page]');
        newPageLinks.forEach(link => {
            // Удаляем старые обработчики перед добавлением новых
            link.removeEventListener('click', handleNavigation);
            link.addEventListener('click', handleNavigation);
        });
        
        // Обрабатываем внешние ссылки
        const externalLinks = pageContent.querySelectorAll('a[href^="http"]:not([data-page])');
        externalLinks.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
        
        // Обрабатываем ссылки на статьи
        const articleLinks = pageContent.querySelectorAll('a[href*="article.html"]');
        articleLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                console.log('📄 Клик по ссылке на статью:', link.href);
                showNotification('Функция загрузки статей будет доступна в следующем обновлении', 'info');
            });
        });
    }
    
    /**
     * Обновляет историю браузера
     * @param {string} page
     */
    function updateBrowserHistory(page) {
        history.pushState({ page }, '', `#${page}`);
        console.log(`📚 Добавлена запись в историю: ${page}`);
    }
    
    /**
     * Прокручивает к началу страницы
     */
    function scrollToTop() {
        try {
            window.scrollTo({
                top: 0,
                behavior: Config.scrollBehavior
            });
        } catch (error) {
            // Fallback для старых браузеров
            window.scrollTo(0, 0);
        }
    }
    
    // =========================================================================
    // UI КОМПОНЕНТЫ
    // =========================================================================
    
    /**
     * Показывает индикатор загрузки
     */
    function showLoadingIndicator() {
        if (!pageContent) return;
        pageContent.style.opacity = '0.7';
        pageContent.style.transition = `opacity ${Config.animationDuration}ms ease`;
    }
    
    /**
     * Скрывает индикатор загрузки
     */
    function hideLoadingIndicator() {
        if (!pageContent) return;
        pageContent.style.opacity = '1';
    }
    
    /**
     * Отображает ошибку
     * @param {Error} error
     */
    function displayError(error) {
        const errorHTML = `
            <div class="error-message" role="alert">
                <div class="error-icon" aria-hidden="true">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2 class="error-title">Ошибка загрузки</h2>
                <div class="error-content">
                    <p>Не удалось загрузить запрошенную страницу.</p>
                    <p class="error-details">
                        <small>${escapeHTML(error.message || 'Неизвестная ошибка')}</small>
                    </p>
                </div>
                <div class="error-actions">
                    <button type="button" class="btn btn--primary" onclick="location.reload()">
                        <i class="fas fa-redo" aria-hidden="true"></i>
                        Обновить страницу
                    </button>
                    <a href="#home" class="btn btn--outline" data-page="home">
                        <i class="fas fa-home" aria-hidden="true"></i>
                        На главную
                    </a>
                </div>
            </div>
        `;
        
        pageContent.innerHTML = errorHTML;
        
        // Добавляем обработчик для кнопки "На главную"
        const homeButton = pageContent.querySelector('[data-page="home"]');
        if (homeButton) {
            homeButton.addEventListener('click', handleNavigation);
        }
    }
    
    /**
     * Показывает уведомление
     * @param {string} message
     * @param {string} type
     */
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <div class="notification__content">
                <i class="fas fa-${getNotificationIcon(type)}" aria-hidden="true"></i>
                <span>${escapeHTML(message)}</span>
            </div>
            <button class="notification__close" aria-label="Закрыть уведомление">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Добавляем обработчик закрытия
        const closeButton = notification.querySelector('.notification__close');
        closeButton.addEventListener('click', () => {
            notification.remove();
        });
        
        // Автоматическое закрытие через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, Config.notificationTimeout);
    }
    
    // =========================================================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // =========================================================================
    
    /**
     * Обрабатывает начальный URL
     */
    function handleInitialUrl() {
        const hash = window.location.hash.substring(1);
        
        console.log('📍 Текущий хэш в URL:', hash || '(отсутствует)');
        
        // Проверяем, является ли это ссылкой на закон
        if (hash.startsWith('law/')) {
            const law = hash.split('/')[1];
            if (law && LawConfig.validLaws.includes(law)) {
                console.log(`📖 Загружаем закон из URL: ${law}`);
                updateActiveNav('zakon');
                loadLawContent(law);
                return;
            }
        }
        
        // Проверяем, является ли это обычной страницей
        if (hash && Config.validPages.includes(hash)) {
            console.log(`📖 Загружаем страницу из URL: ${hash}`);
            updateActiveNav(hash);
            loadPageContent(hash, false);
            return;
        }
        
        // По умолчанию загружаем главную
        console.log('🏠 Показываем домашнюю страницу по умолчанию');
        updateActiveNav('home');
        loadPageContent('home', false);
        history.replaceState({ page: 'home' }, '', '#home');
    }
    
    /**
     * Экранирует HTML
     * @param {string} text
     * @returns {string}
     */
    function escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Возвращает иконку для типа уведомления
     * @param {string} type
     * @returns {string}
     */
    function getNotificationIcon(type) {
        const icons = {
            info: 'info-circle',
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    // =========================================================================
    // ПУБЛИЧНЫЙ API
    // =========================================================================
    
    /** @public {Object} - Публичный API для управления навигацией */
    window.SPANavigation = {
        /**
         * Загружает указанную страницу
         * @param {string} page
         */
        loadPage(page) {
            if (Config.validPages.includes(page)) {
                updateActiveNav(page);
                loadPageContent(page, true);
            } else {
                console.error(`❌ Недопустимое название страницы: ${page}`);
                showNotification(`Страница "${page}" не найдена`, 'error');
            }
        },
        
        /**
         * Загружает указанный закон
         * @param {string} law
         */
        loadLaw(law) {
            if (LawConfig.validLaws.includes(law)) {
                updateActiveNav('zakon');
                loadLawContent(law);
            } else {
                console.error(`❌ Недопустимое название закона: ${law}`);
                showNotification(`Закон "${LawConfig.names[law] || law}" не найден`, 'error');
            }
        },
        
        /**
         * Переключает боковое меню
         */
        toggleSidebar,
        
        /**
         * Закрывает боковое меню
         */
        closeSidebar,
        
        /**
         * Возвращает текущее состояние
         * @returns {Object}
         */
        getState() {
            return {
                currentPage: State.currentPage,
                currentLaw: State.currentLaw,
                isLoading: State.isLoading,
                isSidebarOpen: State.isSidebarOpen,
                validPages: Config.validPages,
                validLaws: LawConfig.validLaws
            };
        },
        
        /**
         * Перезагружает текущую страницу
         */
        reloadPage() {
            if (State.currentPage === 'law' && State.currentLaw) {
                loadLawContent(State.currentLaw);
            } else {
                loadPageContent(State.currentPage, false);
            }
        },
        
        /**
         * Очищает кэш страниц
         */
        clearCache() {
            State.cache.clear();
            State.homeContent = null;
            console.log('🧹 Кэш очищен');
            showNotification('Кэш очищен', 'info');
        },
        
        /**
         * Показывает уведомление (публичный метод)
         * @param {string} message 
         * @param {string} type 
         */
        showNotification
    };
    
    // =========================================================================
    // ЗАПУСК ПРИЛОЖЕНИЯ
    // =========================================================================
    
    // Запускаем приложение после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

// =============================================================================
// ПЛАВАЮЩАЯ КНОПКА "НАВЕРХ" - ОТДЕЛЬНЫЙ МОДУЛЬ
// =============================================================================

(function() {
    'use strict';
    
    function initScrollButton() {
        const scrollTopBtn = document.getElementById('scrollTopBtn');
        
        if (!scrollTopBtn) {
            console.warn('⚠️ Кнопка "Наверх" не найдена');
            return;
        }
        
        // Показываем кнопку после прокрутки на 300px
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        });
        
        // Плавный скролл к началу страницы
        scrollTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            try {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } catch (error) {
                // Fallback для старых браузеров
                smoothScrollToTop();
            }
        });
        
        // Функция для плавного скролла (fallback)
        function smoothScrollToTop() {
            const scrollDuration = 500;
            const scrollStep = -window.scrollY / (scrollDuration / 15);
            
            const scrollInterval = setInterval(function() {
                if (window.scrollY !== 0) {
                    window.scrollBy(0, scrollStep);
                } else {
                    clearInterval(scrollInterval);
                }
            }, 15);
        }
    }
    
    // Запускаем после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollButton);
    } else {
        initScrollButton();
    }
})();