/**
 * Упрощенная система SPA-навигации для ligazpp.ru
 */
(function() {
    'use strict';

    const mainContent = document.getElementById('main-content');
    
    // Функция загрузки контента страницы
    async function loadPage(pageName) {
        // Защита: если страница "home", мы можем либо загрузить home.html, либо обработать её базово
        const url = pageName === 'home' ? 'home.html' : `pages/${pageName}.html`;
        
        try {
            mainContent.style.opacity = '0.5'; // Визуальный отклик начала загрузки
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Страница ${url} не найдена`);
            
            const html = await response.getHTML ? await response.getHTML() : await response.text();
            
            // Вставляем новый контент
            mainContent.innerHTML = html;
            mainContent.style.opacity = '1';
            
            // Скроллим страницу вверх после загрузки
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Обновляем активный класс в меню
            updateActiveLinks(pageName);
            
        } catch (error) {
            console.error('Ошибка навигации:', error);
            mainContent.innerHTML = `<section class="section"><div class="container"><h2>⚠️ Ошибка загрузки</h2><p>Не удалось загрузить страницу. Пожалуйста, выберите другой раздел в меню.</p></div></section>`;
            mainContent.style.opacity = '1';
        }
    }

    // Обновление подсветки активного пункта меню
    function updateActiveLinks(pageName) {
        document.querySelectorAll('[data-page]').forEach(link => {
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('nav__link--active'); // убедись, что класс совпадает с CSS
            } else {
                link.classList.remove('nav__link--active');
            }
        });
    }

    // Слушатель кликов по элементам навигации
    document.addEventListener('click', (e) => {
        const targetLink = e.target.closest('[data-page]');
        
        if (targetLink) {
            e.preventDefault();
            const pageName = targetLink.getAttribute('data-page');
            
            // Меняем хэш в адресной строке (чтобы работали кнопки Назад/Вперед в браузере)
            window.location.hash = pageName;
        }
    });

    // Отслеживание изменения хэша (кнопки браузера + первая загрузка)
    window.addEventListener('hashchange', () => {
        const pageName = window.location.hash.replace('#', '') || 'home';
        loadPage(pageName);
    });

    // Первичная проверка при старте сайта
    const initialPage = window.location.hash.replace('#', '') || 'home';
    if (initialPage !== 'home') {
        loadPage(initialPage);
    }
})();