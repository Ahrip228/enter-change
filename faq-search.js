// FAQ Knowledge Base Search Functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.kb-search-input');
    const contentSections = document.querySelectorAll('.kb-content-section');
    const articles = document.querySelectorAll('.kb-article');
    const categoryCards = document.querySelectorAll('.kb-category-card');
    const popularArticles = document.querySelector('.kb-section');

    if (!searchInput) return;

    // Debounce function for better performance
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

    // Perform search
    function performSearch(query) {
        const searchTerm = query.toLowerCase().trim();

        // If empty search, show everything
        if (searchTerm === '') {
            showAllContent();
            return;
        }

        let hasResults = false;

        // Hide categories and popular articles during search
        if (categoryCards.length > 0) {
            categoryCards.forEach(card => {
                card.style.display = 'none';
            });
        }
        if (popularArticles) {
            popularArticles.style.display = 'none';
        }

        // Search through all articles
        contentSections.forEach(section => {
            let sectionHasResults = false;
            const sectionArticles = section.querySelectorAll('.kb-article');

            sectionArticles.forEach(article => {
                const title = article.querySelector('.kb-article-title')?.textContent.toLowerCase() || '';
                const content = article.querySelector('.kb-article-content')?.textContent.toLowerCase() || '';
                const steps = Array.from(article.querySelectorAll('.kb-step')).map(step =>
                    step.textContent.toLowerCase()
                ).join(' ');

                const fullText = title + ' ' + content + ' ' + steps;

                if (fullText.includes(searchTerm)) {
                    article.style.display = '';
                    highlightSearchTerm(article, searchTerm);
                    sectionHasResults = true;
                    hasResults = true;
                } else {
                    article.style.display = 'none';
                }
            });

            // Show/hide section based on results
            if (sectionHasResults) {
                section.style.display = '';
            } else {
                section.style.display = 'none';
            }
        });

        // Show "no results" message if nothing found
        showNoResults(!hasResults, searchTerm);
    }

    // Highlight search term in results
    function highlightSearchTerm(article, term) {
        // Remove previous highlights
        const highlighted = article.querySelectorAll('.search-highlight');
        highlighted.forEach(el => {
            const text = el.textContent;
            el.replaceWith(text);
        });

        // Add new highlights (only in titles for better UX)
        const title = article.querySelector('.kb-article-title');
        if (title && title.textContent.toLowerCase().includes(term)) {
            const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
            title.innerHTML = title.textContent.replace(regex, '<mark class="search-highlight">$1</mark>');
        }
    }

    // Escape special regex characters
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Show all content (reset search)
    function showAllContent() {
        // Show categories
        categoryCards.forEach(card => {
            card.style.display = '';
        });

        // Show popular articles
        if (popularArticles) {
            popularArticles.style.display = '';
        }

        // Show all sections and articles
        contentSections.forEach(section => {
            section.style.display = '';
            const sectionArticles = section.querySelectorAll('.kb-article');
            sectionArticles.forEach(article => {
                article.style.display = '';
            });
        });

        // Remove highlights
        const highlighted = document.querySelectorAll('.search-highlight');
        highlighted.forEach(el => {
            const text = el.textContent;
            el.replaceWith(text);
        });

        // Remove no results message
        removeNoResultsMessage();
    }

    // Show "no results" message
    function showNoResults(show, term) {
        removeNoResultsMessage();

        if (show) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'kb-no-results';
            noResultsDiv.innerHTML = `
                <div class="kb-no-results-content">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                    <h3>Ничего не найдено</h3>
                    <p>По запросу "<strong>${escapeHtml(term)}</strong>" ничего не найдено.</p>
                    <p>Попробуйте изменить запрос или <a href="#support">свяжитесь с поддержкой</a>.</p>
                </div>
            `;

            const mainContent = document.querySelector('main .container');
            if (mainContent) {
                mainContent.appendChild(noResultsDiv);
            }
        }
    }

    // Remove no results message
    function removeNoResultsMessage() {
        const existing = document.querySelector('.kb-no-results');
        if (existing) {
            existing.remove();
        }
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Add CSS for highlights and no results
    if (!document.querySelector('#kb-search-styles')) {
        const style = document.createElement('style');
        style.id = 'kb-search-styles';
        style.textContent = `
            .search-highlight {
                background: linear-gradient(135deg, var(--accent-primary), var(--accent-cyan));
                color: white;
                padding: 2px 4px;
                border-radius: 3px;
                font-weight: 600;
            }

            .kb-no-results {
                text-align: center;
                padding: 60px 20px;
                margin: 40px 0;
            }

            .kb-no-results-content {
                max-width: 500px;
                margin: 0 auto;
            }

            .kb-no-results svg {
                color: var(--text-secondary);
                opacity: 0.5;
                margin-bottom: 20px;
            }

            .kb-no-results h3 {
                font-size: 1.5rem;
                margin-bottom: 12px;
                color: var(--text-primary);
            }

            .kb-no-results p {
                color: var(--text-secondary);
                margin-bottom: 8px;
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

    // Category card click - scroll to section and highlight
    categoryCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    // Smooth scroll to section
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                    // Clear search if active
                    searchInput.value = '';
                    showAllContent();

                    // Highlight section temporarily
                    targetSection.style.transition = 'background-color 0.3s';
                    targetSection.style.backgroundColor = 'rgba(0, 134, 177, 0.05)';
                    setTimeout(() => {
                        targetSection.style.backgroundColor = '';
                    }, 2000);
                }
            }
        });
    });

    // Popular article links - scroll to article
    const popularLinks = document.querySelectorAll('.kb-article-link');
    popularLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                const targetArticle = document.querySelector(targetId);
                if (targetArticle) {
                    // Smooth scroll
                    targetArticle.scrollIntoView({ behavior: 'smooth', block: 'start' });

                    // Clear search if active
                    searchInput.value = '';
                    showAllContent();

                    // Highlight article temporarily
                    targetArticle.style.transition = 'background-color 0.3s';
                    targetArticle.style.backgroundColor = 'rgba(0, 134, 177, 0.05)';
                    setTimeout(() => {
                        targetArticle.style.backgroundColor = '';
                    }, 2000);
                }
            }
        });
    });

    // Attach search event with debounce
    searchInput.addEventListener('input', debounce(function(e) {
        performSearch(e.target.value);
    }, 300));

    // Clear search on Escape key
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            showAllContent();
        }
    });

    // ========================================
    // Progress Bar Functionality
    // ========================================
    const progressBar = document.getElementById('kb-progress-bar');

    function updateProgressBar() {
        if (!progressBar) return;

        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;

        progressBar.style.width = scrollPercentage + '%';
    }

    window.addEventListener('scroll', updateProgressBar);
    window.addEventListener('resize', updateProgressBar);
    updateProgressBar(); // Initial call

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
    toggleBackToTop(); // Initial call

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ========================================
    // Sidebar Navigation Active State
    // ========================================
    const navLinks = document.querySelectorAll('.kb-nav-link');
    const sections = document.querySelectorAll('.kb-content-section');

    function updateActiveNavLink() {
        if (navLinks.length === 0 || sections.length === 0) return;

        let currentSection = '';
        const scrollPosition = window.pageYOffset + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === currentSection) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', debounce(updateActiveNavLink, 100));
    updateActiveNavLink(); // Initial call

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offset = 100;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================================
    // Breadcrumbs Update
    // ========================================
    const breadcrumbs = document.getElementById('kb-breadcrumbs');

    function updateBreadcrumbs() {
        if (!breadcrumbs) return;

        let currentSection = '';
        const scrollPosition = window.pageYOffset + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        if (currentSection) {
            const sectionTitle = document.querySelector(`#${currentSection} .kb-content-title`)?.textContent;

            if (sectionTitle) {
                breadcrumbs.innerHTML = `
                    <a href="index.html" class="kb-breadcrumb-link">Главная</a>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <a href="#" class="kb-breadcrumb-link">База знаний</a>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span class="kb-breadcrumb-current">${sectionTitle}</span>
                `;
            }
        } else {
            breadcrumbs.innerHTML = `
                <a href="index.html" class="kb-breadcrumb-link">Главная</a>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span class="kb-breadcrumb-current">База знаний</span>
            `;
        }
    }

    window.addEventListener('scroll', debounce(updateBreadcrumbs, 200));
    updateBreadcrumbs(); // Initial call
});
