// Файл: load-footer.js
// ПРОСТОЙ ЗАГРУЗЧИК ПОДВАЛА

(function() {
    // Создаем простой подвал
    const footerHTML = `
        <footer class="site-footer">
            <div class="container">
                <div class="footer-content">
                    <p class="footer-text">
                        © ${new Date().getFullYear()}, БРОО "Лига защитников потребителей"
                    </p>
                </div>
            </div>
        </footer>
    `;
    
    // Вставляем подвал в конец body
    document.body.insertAdjacentHTML('beforeend', footerHTML);
})();