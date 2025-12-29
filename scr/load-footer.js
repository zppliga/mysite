// ЗАГРУЗЧИК ПОДВАЛА

(function() {
    const footerHTML = `
        <footer class="site-footer">
            <div class="container">
                <div class="footer-content">
                    <p class="footer-text">
                        © ${new Date().getFullYear()}, БРОО "Лига защитников потребителей"
                    </p>
                    <p class="footer-text">Все права сохраняются.</p>
                </div>
            </div>
        </footer>
    `;
    
    document.body.insertAdjacentHTML('beforeend', footerHTML);
})();