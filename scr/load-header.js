
//  ЗАГРУЗЧИК ШАПКИ

(function() {
    // Загружаем шапку
    fetch('header.html')
        .then(response => response.text())
        .then(html => {
            // Вставляем шапку в начало body
            document.body.insertAdjacentHTML('afterbegin', html);
            
            // Добавляем активный класс к текущей странице
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            document.querySelectorAll('.nav-link').forEach(link => {
                if (link.getAttribute('href') === currentPage) {
                    link.classList.add('active');
                }
            });
            
            // Активируем мобильное меню
            initMobileMenu();
        })
        .catch(error => {
            console.error('Ошибка загрузки шапки:', error);
            // Если ошибка - создаем простую шапку
            const simpleHeader = `
                <header class="header">
                    <div class="container">
                        <a href="index.html">Лига защитников потребителей</a>
                    </div>
                </header>
            `;
            document.body.insertAdjacentHTML('afterbegin', simpleHeader);
        });
    
    // Функция для мобильного меню
    function initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const nav = document.querySelector('.nav');
        
        if (menuToggle && nav) {
            menuToggle.addEventListener('click', function() {
                nav.classList.toggle('active');
                // Меняем иконку
                const icon = this.querySelector('i');
                if (nav.classList.contains('active')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            });
            
            // Закрываем меню при клике на ссылку
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    nav.classList.remove('active');
                    const icon = menuToggle.querySelector('i');
                    icon.className = 'fas fa-bars';
                });
            });
        }
    }
})();