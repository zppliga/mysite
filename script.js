/**
 * SPA-навигация и интерактивность для ligazpp.ru
 */
(function() {
    'use strict';

    const mainContent = document.getElementById('main-content');

    // --- Навигация ---

    // Преобразует имя страницы в URL фрагмента
    function resolvePageUrl(pageName) {
        return `pages/${pageName}.html`;
    }

    // Вершина маршрута для подсветки меню (например, "articles/tech-goods" -> "articles")
    function activeSegment(pageName) {
        return pageName.split('/')[0];
    }

    // Загрузка контента страницы
    async function loadPage(pageName) {
        const url = resolvePageUrl(pageName);

        try {
            mainContent.style.opacity = '0.5'; // Визуальный отклик начала загрузки

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Страница ${url} не найдена`);

            const html = await response.text();

            // Вставляем новый контент
            mainContent.innerHTML = html;
            mainContent.style.opacity = '1';

            // Скроллим страницу вверх после загрузки
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Обновляем активный пункт в боковом меню
            updateActiveLinks(activeSegment(pageName));
        } catch (error) {
            console.error('Ошибка навигации:', error);
            mainContent.innerHTML = `<section class="section"><div class="container"><h2>⚠️ Ошибка загрузки</h2><p>Не удалось загрузить страницу. Пожалуйста, выберите другой раздел в меню.</p></div></section>`;
            mainContent.style.opacity = '1';
        }
    }

    // Подсветка активного пункта в боковом меню
    function updateActiveLinks(pageName) {
        document.querySelectorAll('.nav__link[data-page]').forEach(link => {
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('nav__link--active');
            } else {
                link.classList.remove('nav__link--active');
            }
        });
    }

    // Переход по клику на любую ссылку с data-page
    document.addEventListener('click', (e) => {
        const targetLink = e.target.closest('[data-page]');

        if (targetLink) {
            e.preventDefault();
            const pageName = targetLink.getAttribute('data-page');

            // На мобильных закрываем меню после перехода
            closeMenu();

            // Меняем хэш в адресной строке (чтобы работали кнопки Назад/Вперед)
            window.location.hash = pageName;
        }
    });

    // Обработка изменения хэша (кнопки браузера + переходы)
    window.addEventListener('hashchange', () => {
        const pageName = window.location.hash.replace('#', '') || 'home';
        loadPage(pageName);
    });

    // Загрузка страницы при старте (включая главную, для единообразия)
    const initialPage = window.location.hash.replace('#', '') || 'home';
    loadPage(initialPage);

    // --- Мобильное меню ---

    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    function closeMenu() {
        if (sidebar) sidebar.classList.remove('sidebar--active');
    }

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar--active');
            const isOpen = sidebar.classList.contains('sidebar--active');
            menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
        });
    }

    // --- Кнопка "Наверх" ---

    const scrollTopBtn = document.getElementById('scrollTopBtn');

    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            scrollTopBtn.classList.toggle('show', window.scrollY > 400);
        }, { passive: true });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- FAQ-аккордеон (работает для контента, загружаемого через SPA) ---

    function toggleFaq(question) {
        const answer = document.getElementById(question.getAttribute('aria-controls'));
        const isOpen = question.getAttribute('aria-expanded') === 'true';

        // Закрываем остальные пункты (классический аккордеон)
        document.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(q => {
            if (q !== question) {
                q.setAttribute('aria-expanded', 'false');
                const other = document.getElementById(q.getAttribute('aria-controls'));
                if (other) other.hidden = true;
            }
        });

        question.setAttribute('aria-expanded', String(!isOpen));
        if (answer) answer.hidden = isOpen;
    }

    document.addEventListener('click', (e) => {
        const question = e.target.closest('.faq-question');
        if (question) toggleFaq(question);
    });

    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.faq-question')) {
            e.preventDefault();
            toggleFaq(e.target);
        }
    });
})();