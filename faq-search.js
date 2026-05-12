// FAQ Knowledge Base — Accordion, Tabs & Search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.kb-search-input');
    const tabs = document.querySelectorAll('.kb-tab');
    const accordions = document.querySelectorAll('.kb-accordion');

    // ========================================
    // Accordion Toggle
    // ========================================
    accordions.forEach(accordion => {
        const header = accordion.querySelector('.kb-accordion-header');
        if (!header) return;

        header.addEventListener('click', function() {
            const isOpen = accordion.classList.contains('open');

            // Close all others
            accordions.forEach(a => {
                if (a !== accordion) {
                    a.classList.remove('open');
                    const body = a.querySelector('.kb-accordion-body');
                    if (body) body.style.maxHeight = null;
                }
            });

            // Toggle current
            if (isOpen) {
                accordion.classList.remove('open');
                const body = accordion.querySelector('.kb-accordion-body');
                if (body) body.style.maxHeight = null;
            } else {
                accordion.classList.add('open');
                const body = accordion.querySelector('.kb-accordion-body');
                if (body) body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });

    // ========================================
    // Tab Filtering
    // ========================================
    let activeCategory = 'all';

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            activeCategory = category;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Clear search
            if (searchInput) {
                searchInput.value = '';
            }
            removeNoResultsMessage();

            // Filter accordions
            filterAccordions();
        });
    });

    function filterAccordions() {
        accordions.forEach(accordion => {
            const cat = accordion.getAttribute('data-category');

            if (activeCategory === 'all' || cat === activeCategory) {
                accordion.style.display = '';
            } else {
                accordion.style.display = 'none';
                // Close hidden accordions
                accordion.classList.remove('open');
                const body = accordion.querySelector('.kb-accordion-body');
                if (body) body.style.maxHeight = null;
            }
        });
    }

    // ========================================
    // Search
    // ========================================
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function performSearch(query) {
        const searchTerm = query.toLowerCase().trim();

        if (searchTerm === '') {
            // Reset: show based on active tab
            filterAccordions();
            removeHighlights();
            removeNoResultsMessage();
            return;
        }

        // Reset tab to "all" during search
        tabs.forEach(t => t.classList.remove('active'));
        const allTab = document.querySelector('.kb-tab[data-category="all"]');
        if (allTab) allTab.classList.add('active');
        activeCategory = 'all';

        let hasResults = false;

        accordions.forEach(accordion => {
            const title = accordion.querySelector('.kb-accordion-title')?.textContent.toLowerCase() || '';
            const content = accordion.querySelector('.kb-article-content')?.textContent.toLowerCase() || '';
            const fullText = title + ' ' + content;

            if (fullText.includes(searchTerm)) {
                accordion.style.display = '';
                highlightTitle(accordion, searchTerm);
                hasResults = true;
            } else {
                accordion.style.display = 'none';
                accordion.classList.remove('open');
                const body = accordion.querySelector('.kb-accordion-body');
                if (body) body.style.maxHeight = null;
            }
        });

        showNoResults(!hasResults, searchTerm);
    }

    function highlightTitle(accordion, term) {
        const titleEl = accordion.querySelector('.kb-accordion-title');
        if (!titleEl) return;

        // Remove previous highlights
        const existing = titleEl.querySelectorAll('.search-highlight');
        existing.forEach(el => {
            el.replaceWith(el.textContent);
        });

        if (titleEl.textContent.toLowerCase().includes(term)) {
            const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
            titleEl.innerHTML = titleEl.textContent.replace(regex, '<mark class="search-highlight">$1</mark>');
        }
    }

    function removeHighlights() {
        const highlighted = document.querySelectorAll('.search-highlight');
        highlighted.forEach(el => {
            el.replaceWith(el.textContent);
        });
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================
    // No Results Message
    // ========================================
    function showNoResults(show, term) {
        removeNoResultsMessage();

        if (show) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'kb-no-results';
            noResultsDiv.innerHTML = `
                <div class="kb-no-results-content">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                    <h3>Ничего не найдено</h3>
                    <p>По запросу «<strong>${escapeHtml(term)}</strong>» ничего не найдено.</p>
                    <p>Попробуйте изменить запрос или <a href="contacts.html">свяжитесь с поддержкой</a>.</p>
                </div>
            `;

            const articlesContainer = document.querySelector('.kb-articles');
            if (articlesContainer) {
                articlesContainer.appendChild(noResultsDiv);
            }
        }
    }

    function removeNoResultsMessage() {
        const existing = document.querySelector('.kb-no-results');
        if (existing) existing.remove();
    }

    // ========================================
    // Search Events
    // ========================================
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            performSearch(e.target.value);
        }, 300));

        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                filterAccordions();
                removeHighlights();
                removeNoResultsMessage();
            }
        });
    }

    // ========================================
    // Inject Dynamic Styles
    // ========================================
    if (!document.querySelector('#kb-search-styles')) {
        const style = document.createElement('style');
        style.id = 'kb-search-styles';
        style.textContent = `
            .search-highlight {
                background: linear-gradient(135deg, var(--accent-primary), var(--accent-cyan));
                color: white;
                padding: 1px 4px;
                border-radius: 3px;
                font-weight: 600;
            }

            .kb-no-results {
                text-align: center;
                padding: 48px 20px;
            }

            .kb-no-results-content {
                max-width: 400px;
                margin: 0 auto;
            }

            .kb-no-results svg {
                color: var(--text-secondary);
                opacity: 0.4;
                margin-bottom: 16px;
            }

            .kb-no-results h3 {
                font-size: 1.25rem;
                margin-bottom: 8px;
                color: var(--text-primary);
            }

            .kb-no-results p {
                color: var(--text-secondary);
                margin-bottom: 6px;
                font-size: var(--font-size-sm);
            }

            .kb-no-results a {
                color: var(--accent-primary);
                text-decoration: underline;
            }

            .kb-no-results a:hover {
                color: var(--accent-cyan);
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // Back to Top Button
    // ========================================
    const backToTopBtn = document.getElementById('kb-back-to-top');

    function toggleBackToTop() {
        if (!backToTopBtn) return;
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', toggleBackToTop);
    toggleBackToTop();

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
