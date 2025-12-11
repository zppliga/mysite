// Загружаем шапку на страницу
fetch('header.html')
    .then(response => response.text())
    .then(data => {
        // Вставляем шапку в начало body
        document.body.insertAdjacentHTML('afterbegin', data);
        
        // Подсвечиваем активную страницу
        highlightActivePage();
    });

// Функция подсветки активной страницы
function highlightActivePage() {
    // Получаем имя текущей страницы
    const currentPage = window.location.pathname.split('/').pop();
    
    // Все ссылки в меню
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        // Сравниваем имена файлов
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}