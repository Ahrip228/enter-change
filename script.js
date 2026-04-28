/* ==========================================
   ENTER-CHANGE — MODERN SCRIPTS
   ========================================== */

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // SCROLL-TRIGGERED ANIMATIONS (IntersectionObserver)
    // ==========================================
    function initScrollAnimations() {
        // Автоматически назначить animate-on-scroll элементам
        const animatableSelectors = [
            '.section-title',
            '.section-subtitle',
            '.step-card',
            '.direction-card',
            '.review-card',
            '.faq-item',
            '.about-stat-card',
            '.about-feature-card',
            '.contact-card',
            '.blog-card',
            '.seo-card',
            '.pricing-card',
            '.how-step',
            '.card',
            '.card-lg',
            '.card-centered',
            '.exchange-card',
            '.exchange-wrapper',
            '.hero-content',
            '.hero-title',
            '.hero-subtitle',
            '.conditions-badges',
            '.footer-column',
            '.dashboard-sidebar',
            '.dashboard-main'
        ];

        const animatableElements = document.querySelectorAll(animatableSelectors.join(', '));

        animatableElements.forEach((el, index) => {
            // Не анимировать элементы, которые уже видны (hero-элементы обрабатываются отдельно)
            if (el.closest('.hero')) return;

            el.classList.add('animate-on-scroll');

            // Добавить stagger-задержку для элементов в гридах
            const parent = el.parentElement;
            if (parent) {
                const siblings = parent.querySelectorAll(':scope > .animate-on-scroll');
                const siblingIndex = Array.from(siblings).indexOf(el);
                if (siblingIndex > 0 && siblingIndex <= 4) {
                    el.classList.add('animate-delay-' + siblingIndex);
                }
            }
        });

        // IntersectionObserver для плавного появления
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.08,
                rootMargin: '0px 0px -40px 0px'
            }
        );

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    // Запускаем анимации с небольшой задержкой для отрисовки
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            initScrollAnimations();
        });
    });

    // ==========================================
    // HERO — ENTRANCE ANIMATIONS
    // ==========================================
    function initHeroAnimations() {
        const heroElements = [
            { selector: '.hero-title', delay: 100 },
            { selector: '.hero-subtitle', delay: 250 },
            { selector: '.conditions-badges', delay: 400 },
            { selector: '.exchange-wrapper', delay: 300 },
            { selector: '.exchange-card', delay: 350 }
        ];

        heroElements.forEach(({ selector, delay }) => {
            const el = document.querySelector(selector);
            if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = `opacity 0.8s var(--ease-out) ${delay}ms, transform 0.8s var(--ease-out) ${delay}ms`;

                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, 50);
            }
        });
    }

    initHeroAnimations();

    // ==========================================
    // HEADER — ТЕНЬ ПРИ СКРОЛЛЕ
    // ==========================================
    const header = document.querySelector('.header');

    if (header) {
        let lastScrollY = 0;
        let ticking = false;

        function updateHeaderScroll() {
            const scrollY = window.scrollY;

            if (scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Скрытие/показ хедера при скролле вниз/вверх
            if (scrollY > 200) {
                if (scrollY > lastScrollY + 5) {
                    header.style.transform = 'translateY(-100%)';
                } else if (scrollY < lastScrollY - 5) {
                    header.style.transform = 'translateY(0)';
                }
            } else {
                header.style.transform = 'translateY(0)';
            }

            lastScrollY = scrollY;
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateHeaderScroll);
                ticking = true;
            }
        }, { passive: true });

        // Добавляем плавную трансформацию
        header.style.transition = 'box-shadow 0.3s ease, transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    // ==========================================
    // ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ
    // ==========================================
    const allThemeToggles = document.querySelectorAll('.theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';

    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    allThemeToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';

            // Плавный переход темы
            document.documentElement.style.transition = 'background-color 0.5s ease, color 0.5s ease';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            updateThemeIcon(next);

            // Убрать transition после завершения
            setTimeout(() => {
                document.documentElement.style.transition = '';
            }, 600);
        });
    });

    function updateThemeIcon(theme) {
        const lightIcons = document.querySelectorAll('.theme-icon-light');
        const darkIcons = document.querySelectorAll('.theme-icon-dark');
        lightIcons.forEach(icon => {
            icon.style.display = theme === 'dark' ? '' : 'none';
        });
        darkIcons.forEach(icon => {
            icon.style.display = theme === 'dark' ? 'none' : '';
        });
    }

    // ==========================================
    // ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА
    // ==========================================
    const langBtns = document.querySelectorAll('.lang-btn');
    const savedLang = localStorage.getItem('lang') || 'ru';

    langBtns.forEach(btn => {
        if (btn.dataset.lang === savedLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
        btn.addEventListener('click', function() {
            langBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            localStorage.setItem('lang', this.dataset.lang);
        });
    });

    // ==========================================
    // НАВИГАЦИЯ — ДРОПДАУН
    // ==========================================
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        if (toggle) {
            toggle.addEventListener('click', function(e) {
                e.stopPropagation();
                const isOpen = dropdown.classList.contains('open');
                dropdowns.forEach(d => d.classList.remove('open'));
                if (!isOpen) {
                    dropdown.classList.add('open');
                }
            });
        }
    });

    document.addEventListener('click', function() {
        dropdowns.forEach(d => d.classList.remove('open'));
    });

    // ==========================================
    // БУРГЕР-МЕНЮ
    // ==========================================
    const burgerBtn = document.querySelector('.burger-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');

    if (burgerBtn && mobileMenu) {
        burgerBtn.addEventListener('click', function() {
            mobileMenu.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    }

    if (mobileMenuClose && mobileMenu) {
        mobileMenuClose.addEventListener('click', function() {
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    }

    // Закрыть мобильное меню при клике на ссылку
    if (mobileMenu) {
        mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // ==========================================
    // РАСКРЫВАЮЩИЕСЯ БЕЙДЖИ (условия)
    // ==========================================
    const badgeToggles = document.querySelectorAll('.condition-badge.clickable');

    badgeToggles.forEach(badge => {
        badge.addEventListener('click', function() {
            const wrapper = this.closest('.condition-badge-wrapper');
            const expandable = wrapper.querySelector('.badge-expandable');
            const isOpen = wrapper.classList.contains('open');

            document.querySelectorAll('.condition-badge-wrapper.open').forEach(w => {
                w.classList.remove('open');
                const exp = w.querySelector('.badge-expandable');
                if (exp) exp.classList.remove('open');
            });

            if (!isOpen && expandable) {
                wrapper.classList.add('open');
                expandable.classList.add('open');
            }
        });
    });

    // ==========================================
    // ПЕРЕКЛЮЧАТЕЛЬ ТИПА КУРСА + ПОКУПКА/ПРОДАЖА
    // ==========================================
    const rateTypeBtns = document.querySelectorAll('.rate-type-btn');

    rateTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const container = this.closest('.rate-type-buttons');
            if (container) {
                container.querySelectorAll('.rate-type-btn').forEach(b => b.classList.remove('active'));
            }
            this.classList.add('active');

            const rateType = this.dataset.rateType;

            // Плавающий/Фиксированный курс (index.html)
            const badgeText = document.getElementById('rate-type-badge-text');
            const badgeDesc = document.getElementById('rate-type-badge-description');
            if (badgeText && badgeDesc) {
                if (rateType === 'floating') {
                    badgeText.textContent = 'По подтверждениям';
                    badgeDesc.textContent = 'Курс не фиксируется и фиксируется только в момент получения подтверждений в блокчейн-сети. Это обеспечивает актуальность курса на момент завершения транзакции.';
                } else if (rateType === 'fixed') {
                    badgeText.textContent = 'Фиксированный';
                    badgeDesc.textContent = 'Курс фиксируется в момент создания заявки и не меняется до её выполнения. Вы получите именно ту сумму, которая указана при создании заявки.';
                }
            }

            // Покупка/Продажа (фиат и наличные)
            if (rateType === 'buy' || rateType === 'sell') {
                const card = this.closest('.exchange-card');
                if (!card) return;

                const prevMode = card.dataset.mode || 'buy';
                if (prevMode === rateType) return;
                card.dataset.mode = rateType;

                const form = card.querySelector('.exchange-form');
                if (!form) return;

                const fields = form.querySelectorAll('.exchange-field');
                if (fields.length < 2) return;

                const field1 = fields[0];
                const field2 = fields[1];

                // Определяем страницу наличных по наличию селектора города
                const allNetLabels = Array.from(form.querySelectorAll('.exchange-network-label'));
                const isCashPage = allNetLabels.some(l => l.textContent.trim() === 'Город');

                // Меняем валютные селекторы
                const cs1 = field1.querySelector('.currency-select');
                const cs2 = field2.querySelector('.currency-select');
                if (cs1 && cs2) {
                    const temp = cs1.innerHTML;
                    cs1.innerHTML = cs2.innerHTML;
                    cs2.innerHTML = temp;
                }

                // Меняем значения и readonly
                const input1 = field1.querySelector('input');
                const input2 = field2.querySelector('input');
                if (input1 && input2) {
                    const tempVal = input1.value;
                    input1.value = input2.value;
                    input2.value = tempVal;

                    const tempRO = input1.readOnly;
                    input1.readOnly = input2.readOnly;
                    input2.readOnly = tempRO;
                }

                // Обновляем лейблы полей
                const label1 = field1.querySelector('label');
                const label2 = field2.querySelector('label');
                if (label1 && label2) {
                    if (isCashPage) {
                        label1.textContent = rateType === 'sell' ? 'Отдаёте' : 'Отдаёте наличными';
                        label2.textContent = rateType === 'sell' ? 'Получаете наличными' : 'Получаете';
                    }
                    // На фиатной странице лейблы "Отдаёте"/"Получаете" не меняются
                }

                // Меняем сетевые элементы (пропускаем город)
                const networks = Array.from(form.querySelectorAll('.exchange-network'));
                const swappable = networks.filter(n => {
                    const lbl = n.querySelector('.exchange-network-label');
                    return lbl && lbl.textContent.trim() !== 'Город';
                });

                if (swappable.length === 2) {
                    // Фиат: два сетевых блока (Банк + Сеть)
                    const nb1 = swappable[0].querySelector('.exchange-network-btn');
                    const nb2 = swappable[1].querySelector('.exchange-network-btn');
                    if (nb1 && nb2) {
                        const temp = nb1.innerHTML;
                        nb1.innerHTML = nb2.innerHTML;
                        nb2.innerHTML = temp;
                    }
                    const nl1 = swappable[0].querySelector('.exchange-network-label');
                    const nl2 = swappable[1].querySelector('.exchange-network-label');
                    if (nl1 && nl2) {
                        nl1.textContent = rateType === 'sell' ? 'Сеть отдачи' : 'Банк';
                        nl2.textContent = rateType === 'sell' ? 'Банк' : 'Сеть получения';
                    }
                } else if (swappable.length === 1) {
                    // Наличные: один сетевой блок (Сеть)
                    const netLabel = swappable[0].querySelector('.exchange-network-label');
                    if (netLabel) {
                        netLabel.textContent = rateType === 'sell' ? 'Сеть отдачи' : 'Сеть получения';
                    }
                }
            }
        });
    });

    // ==========================================
    // ТАБЫ (Покупка/Продажа)
    // ==========================================
    const exchangeTabs = document.querySelectorAll('.exchange-tab');
    const tabIndicator = document.querySelector('.exchange-tabs-indicator');

    exchangeTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            exchangeTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            if (tabIndicator) {
                const idx = Array.from(exchangeTabs).indexOf(this);
                if (idx === 0) {
                    tabIndicator.classList.remove('right');
                } else {
                    tabIndicator.classList.add('right');
                }
            }
        });
    });

    // ==========================================
    // FAQ АККОРДЕОН
    // ==========================================
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const item = this.closest('.faq-item');
            const answer = item.querySelector('.faq-answer');
            const isOpen = item.classList.contains('open');

            // Закрыть все
            document.querySelectorAll('.faq-item.open').forEach(openItem => {
                openItem.classList.remove('open');
                const a = openItem.querySelector('.faq-answer');
                if (a) a.style.maxHeight = '0';
            });

            if (!isOpen && answer) {
                item.classList.add('open');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // ==========================================
    // ТАЙМЕР ОБНОВЛЕНИЯ КУРСА
    // ==========================================
    const timerElements = document.querySelectorAll('.rate-timer-value');

    timerElements.forEach(timer => {
        let seconds = parseInt(timer.textContent) || 60;

        setInterval(function() {
            seconds--;
            if (seconds <= 0) seconds = 60;
            timer.textContent = seconds;
        }, 1000);
    });

    // ==========================================
    // КОПИРОВАНИЕ В БУФЕР
    // ==========================================
    const copyBtns = document.querySelectorAll('.copy-btn');

    copyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const field = this.closest('.copy-field');
            const value = field ? field.querySelector('.copy-value') : null;

            if (value) {
                const text = value.textContent.trim();
                navigator.clipboard.writeText(text).then(() => {
                    this.classList.add('copied');
                    const originalHTML = this.innerHTML;
                    this.textContent = 'Скопировано!';

                    setTimeout(() => {
                        this.classList.remove('copied');
                        this.innerHTML = originalHTML;
                    }, 2000);
                });
            }
        });
    });

    // ==========================================
    // ЧЕКБОКСЫ
    // ==========================================
    const checkboxes = document.querySelectorAll('.checkbox');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('click', function() {
            this.classList.toggle('checked');
        });
    });

    // ==========================================
    // САЙДБАР ДАШБОРДА
    // ==========================================
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                sidebarLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');

                const targetId = href.substring(1);
                document.querySelectorAll('.dashboard-section').forEach(section => {
                    section.classList.add('hidden');
                });
                const target = document.getElementById(targetId);
                if (target) target.classList.remove('hidden');
            }
        });
    });

    // ==========================================
    // ФИЛЬТРЫ (пилюли)
    // ==========================================
    const filterPills = document.querySelectorAll('.filter-pill');

    filterPills.forEach(pill => {
        pill.addEventListener('click', function() {
            const group = this.closest('.filter-pills');
            if (group) {
                group.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            }
            this.classList.add('active');
        });
    });

    // ==========================================
    // КНОПКА SWAP (переворот направления)
    // ==========================================
    const swapBtn = document.querySelector('.swap-btn');

    if (swapBtn) {
        swapBtn.addEventListener('click', function() {
            // Анимация вращения
            this.style.transform = 'rotate(180deg) scale(1.1)';
            setTimeout(() => {
                this.style.transform = '';
            }, 400);

            const fields = document.querySelectorAll('.exchange-field');
            if (fields.length >= 2) {
                const firstInput = fields[0].querySelector('.exchange-field-input');
                const secondInput = fields[1].querySelector('.exchange-field-input');
                if (firstInput && secondInput) {
                    const temp = firstInput.value;
                    firstInput.value = secondInput.value;
                    secondInput.value = temp;
                }
            }
        });
    }

    // ==========================================
    // ТИП КАРТЫ (верификация)
    // ==========================================
    const cardTypeBtns = document.querySelectorAll('.card-type-btn');

    cardTypeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            cardTypeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const cardType = this.dataset.cardType;
            document.querySelectorAll('.card-type-content').forEach(content => {
                content.classList.add('hidden');
            });
            const target = document.getElementById('card-type-' + cardType);
            if (target) target.classList.remove('hidden');
        });
    });

    // ==========================================
    // DRAG & DROP ЗАГРУЗКА ФАЙЛОВ
    // ==========================================
    const uploadAreas = document.querySelectorAll('.upload-area');

    uploadAreas.forEach(area => {
        area.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--accent-cyan)';
            this.style.background = 'rgba(51, 231, 255, 0.05)';
        });

        area.addEventListener('dragleave', function() {
            this.style.borderColor = '';
            this.style.background = '';
        });

        area.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '';
            this.style.background = '';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const uploadText = this.querySelector('.upload-text');
                if (uploadText) {
                    uploadText.textContent = files[0].name;
                }
            }
        });

        area.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.addEventListener('change', function() {
                if (this.files.length > 0) {
                    const uploadText = area.querySelector('.upload-text');
                    if (uploadText) {
                        uploadText.textContent = this.files[0].name;
                    }
                }
            });
            input.click();
        });
    });

    // ==========================================
    // ПЛАВНЫЙ СКРОЛЛ
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // ==========================================
    // RIPPLE-ЭФФЕКТ НА КНОПКАХ
    // ==========================================
    function initRippleEffect() {
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');

        buttons.forEach(btn => {
            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';

            btn.addEventListener('click', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = document.createElement('span');
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.25);
                    width: 0;
                    height: 0;
                    left: ${x}px;
                    top: ${y}px;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                    animation: rippleEffect 0.6s ease-out forwards;
                `;

                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 700);
            });
        });

        // Добавить keyframes для ripple
        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes rippleEffect {
                    0% { width: 0; height: 0; opacity: 0.5; }
                    100% { width: 300px; height: 300px; opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    initRippleEffect();

    // ==========================================
    // FOCUS УЛУЧШЕНИЯ ДЛЯ ИНПУТОВ
    // ==========================================
    function initInputAnimations() {
        const inputs = document.querySelectorAll('.exchange-field-input, .form-input, .form-textarea');

        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                const field = this.closest('.exchange-field') || this.closest('.form-group');
                if (field) {
                    field.classList.add('focused');
                }
            });

            input.addEventListener('blur', function() {
                const field = this.closest('.exchange-field') || this.closest('.form-group');
                if (field) {
                    field.classList.remove('focused');
                }
            });
        });
    }

    initInputAnimations();

    // ==========================================
    // ЧИСЛОВОЕ ФОРМАТИРОВАНИЕ ИНПУТОВ
    // ==========================================
    function initNumberFormatting() {
        const amountInputs = document.querySelectorAll('.exchange-field-input[type="text"]');

        amountInputs.forEach(input => {
            input.addEventListener('input', function() {
                // Разрешаем только цифры и точку
                let val = this.value.replace(/[^\d.]/g, '');
                // Не больше одной точки
                const parts = val.split('.');
                if (parts.length > 2) {
                    val = parts[0] + '.' + parts.slice(1).join('');
                }
                this.value = val;
            });
        });
    }

    initNumberFormatting();

    // ==========================================
    // PROGRESS STEPS — АНИМАЦИЯ ТЕКУЩЕГО ШАГА
    // ==========================================
    function initProgressSteps() {
        const activeStep = document.querySelector('.progress-step.active');
        if (activeStep) {
            activeStep.style.animation = 'pulse 2s ease-in-out infinite';
        }
    }

    initProgressSteps();

    // ==========================================
    // BACK TO TOP — КНОПКА НАВЕРХ
    // ==========================================
    function initBackToTop() {
        // Не создаем кнопку если уже есть специфичная (например, на FAQ странице)
        if (document.getElementById('kb-back-to-top')) {
            return;
        }

        const btn = document.createElement('button');
        btn.className = 'back-to-top';
        btn.setAttribute('aria-label', 'Наверх');
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4L4 10M10 4L16 10M10 4V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        document.body.appendChild(btn);

        // Стили для кнопки
        if (!document.getElementById('back-to-top-styles')) {
            const style = document.createElement('style');
            style.id = 'back-to-top-styles';
            style.textContent = `
                .back-to-top {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: var(--bg-glass);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid var(--border-color-muted);
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(16px);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 900;
                }
                .back-to-top.show {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }
                .back-to-top:hover {
                    background: var(--accent-primary);
                    border-color: var(--accent-primary);
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 16px rgba(0, 134, 177, 0.3);
                }
            `;
            document.head.appendChild(style);
        }

        let btTicking = false;
        window.addEventListener('scroll', function() {
            if (!btTicking) {
                requestAnimationFrame(function() {
                    if (window.scrollY > 400) {
                        btn.classList.add('show');
                    } else {
                        btn.classList.remove('show');
                    }
                    btTicking = false;
                });
                btTicking = true;
            }
        }, { passive: true });

        btn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    initBackToTop();

    // ==========================================
    // TOOLTIP HOVER (для элементов с data-tooltip)
    // ==========================================
    function initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');

        tooltipElements.forEach(el => {
            let tooltipEl = null;

            el.addEventListener('mouseenter', function(e) {
                const text = this.dataset.tooltip;
                if (!text) return;

                tooltipEl = document.createElement('div');
                tooltipEl.className = 'tooltip-popup';
                tooltipEl.textContent = text;
                document.body.appendChild(tooltipEl);

                const rect = this.getBoundingClientRect();
                tooltipEl.style.cssText = `
                    position: fixed;
                    z-index: 9999;
                    background: var(--surface-light, #EBF2F5);
                    color: var(--text-dark, #00243E);
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    max-width: 250px;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                    pointer-events: none;
                    opacity: 0;
                    transform: translateY(4px);
                    transition: opacity 0.2s ease, transform 0.2s ease;
                    left: ${rect.left + rect.width / 2}px;
                    top: ${rect.top - 8}px;
                    transform: translate(-50%, -100%) translateY(4px);
                `;

                requestAnimationFrame(() => {
                    if (tooltipEl) {
                        tooltipEl.style.opacity = '1';
                        tooltipEl.style.transform = 'translate(-50%, -100%) translateY(0)';
                    }
                });
            });

            el.addEventListener('mouseleave', function() {
                if (tooltipEl) {
                    tooltipEl.remove();
                    tooltipEl = null;
                }
            });
        });
    }

    initTooltips();

});
