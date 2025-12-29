// scr/load-article.js

document.addEventListener('DOMContentLoaded', function() {
    // Получаем имя файла статьи из URL
    function getArticleFileName() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('article') || 'cennik_ne_tot.txt';
    }
    
    // Функция для парсинга и форматирования статьи
    function formatArticleContent(content) {
        // Заменяем переносы строк на теги <p>
        let formatted = content
            .split('\n\n')
            .map(paragraph => {
                if (paragraph.trim() === '') return '';
                
                // Обработка заголовков
                if (paragraph.startsWith('Что делать')) {
                    return `<h2>${paragraph}</h2>`;
                }
                
                // Обработка подзаголовков
                if (paragraph.startsWith('Почему это важно?')) {
                    return `<h2>${paragraph}</h2>`;
                }
                
                // Обработка списков
                if (paragraph.match(/^\d+\.\s+/)) {
                    const items = paragraph.split('\n');
                    let listHtml = '<ol>';
                    items.forEach(item => {
                        if (item.trim()) {
                            listHtml += `<li>${item.replace(/^\d+\.\s+/, '')}</li>`;
                        }
                    });
                    listHtml += '</ol>';
                    return listHtml;
                }
                
                // Обработка примеров (ищем ключевые слова)
                if (paragraph.includes('Простой пример') || paragraph.includes('Например')) {
                    return `<div class="article-example"><h3>${paragraph.split('\n')[0]}</h3><p>${paragraph.split('\n').slice(1).join('<br>')}</p></div>`;
                }
                
                // Обработка советов
                if (paragraph.includes('Совет') || paragraph.includes('Рекомендация')) {
                    return `<div class="article-tip"><p>${paragraph}</p></div>`;
                }
                
                // Обработка важных моментов
                if (paragraph.includes('Закон говорит') || paragraph.includes('Согласно закону')) {
                    return `<div class="article-important"><p>${paragraph}</p></div>`;
                }
                
                // Обработка пунктов списка со звездочками
                if (paragraph.startsWith('     •') || paragraph.includes('•')) {
                    const items = paragraph.split('•').filter(item => item.trim());
                    let listHtml = '<ul>';
                    items.forEach(item => {
                        listHtml += `<li>${item.trim()}</li>`;
                    });
                    listHtml += '</ul>';
                    return listHtml;
                }
                
                // Обычные абзацы
                return `<p>${paragraph}</p>`;
            })
            .join('');
        
        return formatted;
    }
    
    // Функция для загрузки статьи
    async function loadArticle() {
        const articleFileName = getArticleFileName();
        const articleTitle = document.getElementById('article-title');
        const articleContent = document.getElementById('article-content');
        
        try {
            // Загружаем статью из папки articles
            const response = await fetch(`articles/${articleFileName}`);
            
            if (!response.ok) {
                throw new Error('Статья не найдена');
            }
            
            const text = await response.text();
            
            // Извлекаем заголовок из первой строки
            const lines = text.split('\n');
            let title = lines[0];
            let content = lines.slice(1).join('\n');
            
            // Если первая строка не похожа на заголовок, используем имя файла
            if (title.length > 100 || title.trim() === '') {
                title = articleFileName.replace('.txt', '').replace(/_/g, ' ');
                content = text;
            }
            
            // Обновляем заголовок страницы
            articleTitle.textContent = title;
            document.title = `${title} | Лига защитников потребителей`;
            
            // Форматируем и отображаем контент
            articleContent.innerHTML = formatArticleContent(content);
            
            // Обновляем хлебные крошки
            updateBreadcrumbs(title);
            
        } catch (error) {
            console.error('Ошибка загрузки статьи:', error);
            articleContent.innerHTML = `
                <div class="error-message">
                    <h2>Статья не найдена</h2>
                    <p>Извините, запрашиваемая статья временно недоступна.</p>
                    <a href="articles.html" class="btn">Вернуться к списку статей</a>
                </div>
            `;
        }
    }
    
    // Функция для обновления хлебных крошек
    function updateBreadcrumbs(articleTitle) {
        const breadcrumbSpan = document.querySelector('.breadcrumbs span:last-child');
        if (breadcrumbSpan) {
            // Обрезаем длинный заголовок для хлебных крошек
            const shortTitle = articleTitle.length > 30 
                ? articleTitle.substring(0, 30) + '...' 
                : articleTitle;
            breadcrumbSpan.textContent = shortTitle;
        }
    }
    
    // Загружаем статью при загрузке страницы
    loadArticle();
});