// ===========================================
// JavaScript для сайта "Лига защитников потребителей"
// Минимальная интерактивность
// ===========================================

// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. ВСТАВКА ТЕКУЩЕГО ГОДА В ФУТЕРЕ ---
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        const currentYear = new Date().getFullYear();
        currentYearElement.textContent = currentYear;
    }
    
    // --- 2. МОБИЛЬНОЕ МЕНЮ ---
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (menuToggle && nav) {
        // Обработчик клика по кнопке меню
        menuToggle.addEventListener('click', function() {
            // Переключаем класс 'active' у меню
            nav.classList.toggle('active');
            
            // Меняем иконку на кнопке
            const icon = this.querySelector('i');
            if (nav.classList.contains('active')) {
                icon.className = 'fas fa-times'; // Иконка "крестик"
                this.setAttribute('aria-label', 'Закрыть меню');
            } else {
                icon.className = 'fas fa-bars'; // Иконка "бургер"
                this.setAttribute('aria-label', 'Открыть меню');
            }
        });
        
        // Закрытие меню при клике на ссылку
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                // Закрываем меню
                nav.classList.remove('active');
                
                // Возвращаем иконку бургер-меню
                const icon = menuToggle.querySelector('i');
                icon.className = 'fas fa-bars';
                menuToggle.setAttribute('aria-label', 'Открыть меню');
            });
        });
        
        // Закрытие меню при клике вне его области
        document.addEventListener('click', function(event) {
            // Если клик не по кнопке меню и не по самому меню
            if (!menuToggle.contains(event.target) && !nav.contains(event.target)) {
                nav.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.className = 'fas fa-bars';
                menuToggle.setAttribute('aria-label', 'Открыть меню');
            }
        });
    }
    
    // --- 3. ПЛАВНАЯ ПРОКРУТКА ДЛЯ ССЫЛОК С ЯКОРЯМИ ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(event) {
            const href = this.getAttribute('href');
            
            // Только для якорей (ссылок, начинающихся с #)
            if (href !== '#' && href.startsWith('#')) {
                event.preventDefault();
                
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Плавная прокрутка к элементу
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Учитываем высоту шапки
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // --- 4. ПОДСВЕТКА АКТИВНОГО ПУНКТА МЕНЮ ПРИ СКРОЛЛЕ ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function highlightMenuOnScroll() {
        let currentSectionId = '';
        
        // Определяем, какой раздел сейчас в области видимости
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop && 
                window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        // Убираем активный класс у всех ссылок
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            // Добавляем активный класс к соответствующей ссылке
            const href = link.getAttribute('href');
            if (href === `#${currentSectionId}` || 
                (currentSectionId === '' && href === '/')) {
                link.classList.add('active');
            }
        });
    }
    
    // Вызываем функцию при загрузке и скролле
    window.addEventListener('scroll', highlightMenuOnScroll);
    
    // --- 5. ДОБАВЛЕНИЕ ЭФФЕКТА ПРИ НАВЕДЕНИИ НА КАРТОЧКИ ---
    const articleCards = document.querySelectorAll('.article-card');
    
    articleCards.forEach(card => {
        // Добавляем небольшой эффект при наведении (уже есть в CSS, но можно добавить JS-эффекты)
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
    
    // --- 6. ОБРАБОТКА ВНЕШНИХ ССЫЛОК (добавляем атрибут безопасности) ---
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        if (!link.hasAttribute('rel')) {
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
    
    // --- 7. ПРОСТОЙ АНАЛИТИКИ (опционально) ---
    // Можно добавить отслеживание кликов по важным элементам
    document.querySelectorAll('.law-item, .article-title a').forEach(element => {
        element.addEventListener('click', function() {
            console.log(`Клик по: ${this.textContent.trim().substring(0, 30)}...`);
            // Здесь можно добавить отправку данных в аналитику (Google Analytics и т.д.)
        });
    });
});

// Функция для показа/скрытия дополнительной информации
function toggleInfo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
}

// Функция для копирования email (можно добавить на странице контактов)
function copyEmail() {
    const email = 'info@ligazpp.ru';
    navigator.clipboard.writeText(email).then(() => {
        alert('Email скопирован в буфер обмена: ' + email);
    });
}

// ===========================================
// ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ БУДУЩЕГО РАСШИРЕНИЯ
// ===========================================

// Для формы поиска (если добавите)
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            // Здесь можно добавить логику поиска
            console.log('Поиск:', this.value);
        });
    }
}

// Для фильтрации статей по категориям
function filterArticles(category) {
    const articles = document.querySelectorAll('.article-card');
    articles.forEach(article => {
        const articleCategory = article.querySelector('.article-category').textContent;
        if (category === 'all' || articleCategory.includes(category)) {
            article.style.display = 'block';
        } else {
            article.style.display = 'none';
        }
    });
}
// ====================================
// ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ СТРАНИЦЫ "КОНТАКТЫ"
// ====================================

// Копирование адреса в буфер обмена
function copyAddress() {
    const address = "308009, г. Белгород, ул. Князя Трубецкого, д. 17, оф. 909";
    navigator.clipboard.writeText(address).then(() => {
        // Показываем уведомление
        showNotification('Адрес скопирован в буфер обмена');
    }).catch(err => {
        console.error('Ошибка при копировании: ', err);
        showNotification('Не удалось скопировать адрес', 'error');
    });
}

// Функция для скачивания графика работы (заглушка)
function downloadSchedule() {
    showNotification('График работы скачан в формате PDF');
    // В реальном проекте здесь будет ссылка на PDF файл
}

// Показ уведомлений
function showNotification(message, type = 'success') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Добавляем стили
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        padding: 15px 20px;
        border-radius: 6px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    // Добавляем на страницу
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Обработка формы обратной связи
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Получаем данные формы
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Валидация
            if (!data.name || !data.email || !data.message) {
                showNotification('Пожалуйста, заполните обязательные поля', 'error');
                return;
            }
            
            // Имитация отправки (в реальном проекте здесь AJAX запрос)
            console.log('Данные формы:', data);
            
            // Показываем успешное сообщение
            showNotification('Ваше сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
            
            // Очищаем форму
            this.reset();
        });
        
        // Маска для телефона
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                let value = this.value.replace(/\D/g, '');
                if (value.length > 0) {
                    value = '+7 (' + value.substring(1, 4) + ') ' + value.substring(4, 7) + '-' + value.substring(7, 9) + '-' + value.substring(9, 11);
                    value = value.replace(/-$/, '').replace(/\) $/, ')');
                }
                this.value = value;
            });
        }
    }
}

// Инициализация при загрузке страницы
if (document.querySelector('body').classList.contains('contacts-page')) {
    initContactForm();
}

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);