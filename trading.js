// Спотовая торговля - JavaScript
(function() {
    // Данные торговых пар
    const tradingPairs = {
        'BTC/USDT': {
            baseIcon: '₿',
            quoteIcon: '₮',
            baseColor: '#F7931A',
            quoteColor: '#26A17B',
            baseCurrency: 'BTC',
            quoteCurrency: 'USDT',
            currentPrice: 94235,
            change24h: 2.45,
            high24h: 95840,
            low24h: 92100,
            volume24h: 1234
        },
        'ETH/USDT': {
            baseIcon: 'Ξ',
            quoteIcon: '₮',
            baseColor: '#627EEA',
            quoteColor: '#26A17B',
            baseCurrency: 'ETH',
            quoteCurrency: 'USDT',
            currentPrice: 3450,
            change24h: -1.23,
            high24h: 3520,
            low24h: 3398,
            volume24h: 8542
        },
        'BNB/USDT': {
            baseIcon: 'B',
            quoteIcon: '₮',
            baseColor: '#F3BA2F',
            quoteColor: '#26A17B',
            baseCurrency: 'BNB',
            quoteCurrency: 'USDT',
            currentPrice: 620,
            change24h: 3.12,
            high24h: 635,
            low24h: 605,
            volume24h: 12400
        },
        'SOL/USDT': {
            baseIcon: '◎',
            quoteIcon: '₮',
            baseColor: '#00D4AA',
            quoteColor: '#26A17B',
            baseCurrency: 'SOL',
            quoteCurrency: 'USDT',
            currentPrice: 145,
            change24h: 5.67,
            high24h: 152,
            low24h: 138,
            volume24h: 45600
        },
        'XRP/USDT': {
            baseIcon: 'X',
            quoteIcon: '₮',
            baseColor: '#00AAE4',
            quoteColor: '#26A17B',
            baseCurrency: 'XRP',
            quoteCurrency: 'USDT',
            currentPrice: 0.52,
            change24h: -2.89,
            high24h: 0.55,
            low24h: 0.50,
            volume24h: 125000000
        }
    };

    // Состояние
    let currentPair = 'BTC/USDT';
    let tradeSide = 'buy'; // 'buy' или 'sell'
    const userBalance = {
        USDT: 1000,
        BTC: 0.05,
        ETH: 2.5,
        BNB: 10,
        SOL: 50,
        XRP: 5000
    };

    // Элементы
    const pairSelector = document.getElementById('pairSelector');
    const currentPriceEl = document.getElementById('currentPrice');
    const priceChangeEl = document.getElementById('priceChange');
    const high24hEl = document.getElementById('high24h');
    const low24hEl = document.getElementById('low24h');
    const volume24hEl = document.getElementById('volume24h');
    const buyBtn = document.getElementById('buyBtn');
    const sellBtn = document.getElementById('sellBtn');
    const priceInput = document.getElementById('priceInput');
    const amountInput = document.getElementById('amountInput');
    const maxBtn = document.getElementById('maxBtn');
    const totalValue = document.getElementById('totalValue');
    const submitBtn = document.getElementById('submitBtn');
    const availableBalance = document.getElementById('availableBalance');
    const percentBtns = document.querySelectorAll('.trading-percent-btn');

    // Модальное окно пары
    const pairModal = document.getElementById('pairModal');
    const pairModalOverlay = pairModal.querySelector('.currency-modal-overlay');
    const pairModalClose = pairModal.querySelector('.currency-modal-close');
    const pairList = document.getElementById('pairList');
    const pairSearch = document.getElementById('pairSearch');

    // Canvas для графика
    const chartCanvas = document.getElementById('chartCanvas');
    const ctx = chartCanvas ? chartCanvas.getContext('2d') : null;

    // Генерация данных для свечного графика
    function generateCandleData(basePrice, count = 30) {
        const data = [];
        let price = basePrice;

        for (let i = 0; i < count; i++) {
            const open = price;
            const change = (Math.random() - 0.45) * (basePrice * 0.02);
            const close = open + change;
            const high = Math.max(open, close) * (1 + Math.random() * 0.01);
            const low = Math.min(open, close) * (1 - Math.random() * 0.01);

            data.push({ open, high, low, close });
            price = close;
        }

        return data;
    }

    // Рисование графика
    function drawChart() {
        if (!ctx || !chartCanvas) return;

        const pair = tradingPairs[currentPair];
        const candleData = generateCandleData(pair.currentPrice);

        // Получаем реальный размер canvas
        const rect = chartCanvas.getBoundingClientRect();
        chartCanvas.width = rect.width * window.devicePixelRatio || rect.width;
        chartCanvas.height = rect.height * window.devicePixelRatio || rect.height;
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

        const width = rect.width;
        const height = rect.height;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Находим min/max для масштабирования
        const prices = candleData.flatMap(d => [d.high, d.low]);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice;

        // Очистка canvas
        ctx.clearRect(0, 0, width, height);

        // Получаем цвета из CSS переменных
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const bgColor = isDark ? '#0a1929' : '#f8fafc';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const greenColor = '#10b981';
        const redColor = '#ef4444';

        // Фон
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // Сетка
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();

            // Цены на оси Y
            const price = maxPrice - (priceRange / 5) * i;
            ctx.fillStyle = textColor;
            ctx.font = '11px Inter, system-ui, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('$' + price.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0}), padding - 8, y + 4);
        }

        // Рисование свечей
        const candleWidth = chartWidth / candleData.length * 0.7;
        const candleSpacing = chartWidth / candleData.length;

        candleData.forEach((candle, i) => {
            const x = padding + candleSpacing * i + candleSpacing / 2;
            const isGreen = candle.close >= candle.open;

            const openY = padding + chartHeight - ((candle.open - minPrice) / priceRange) * chartHeight;
            const closeY = padding + chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight;
            const highY = padding + chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight;
            const lowY = padding + chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight;

            ctx.strokeStyle = isGreen ? greenColor : redColor;
            ctx.fillStyle = isGreen ? greenColor : redColor;
            ctx.lineWidth = 1;

            // Фитиль (высокий-низкий)
            ctx.beginPath();
            ctx.moveTo(x, highY);
            ctx.lineTo(x, lowY);
            ctx.stroke();

            // Тело свечи
            const bodyHeight = Math.abs(closeY - openY) || 1;
            const bodyY = Math.min(openY, closeY);

            ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);
        });

        // Текущая цена линия
        const currentY = padding + chartHeight - ((pair.currentPrice - minPrice) / priceRange) * chartHeight;
        ctx.strokeStyle = pair.change24h >= 0 ? greenColor : redColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, currentY);
        ctx.lineTo(width - padding, currentY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Метка текущей цены
        ctx.fillStyle = pair.change24h >= 0 ? greenColor : redColor;
        ctx.fillRect(width - padding + 5, currentY - 12, 90, 24);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('$' + pair.currentPrice.toLocaleString('en-US', {minimumFractionDigits: 2}), width - padding + 10, currentY + 4);
    }

    // Обновление UI текущей пары
    function updatePairUI() {
        const pair = tradingPairs[currentPair];

        // Обновляем селектор пары
        const baseIcon = document.querySelector('.trading-pair-icon.base');
        const quoteIcon = document.querySelector('.trading-pair-icon.quote');
        const pairName = document.querySelector('.trading-pair-name');

        if (baseIcon) {
            baseIcon.textContent = pair.baseIcon;
            baseIcon.style.background = `linear-gradient(135deg, ${pair.baseColor}, ${adjustColor(pair.baseColor, -20)})`;
        }
        if (quoteIcon) {
            quoteIcon.textContent = pair.quoteIcon;
            quoteIcon.style.background = `linear-gradient(135deg, ${pair.quoteColor}, ${adjustColor(pair.quoteColor, -20)})`;
        }
        if (pairName) {
            pairName.textContent = currentPair;
        }

        // Обновляем цену и изменение
        if (currentPriceEl) {
            currentPriceEl.textContent = `$${pair.currentPrice.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
        }
        if (priceChangeEl) {
            priceChangeEl.textContent = `${pair.change24h > 0 ? '+' : ''}${pair.change24h.toFixed(2)}%`;
            priceChangeEl.className = `trading-price-change ${pair.change24h >= 0 ? 'positive' : 'negative'}`;
        }

        // Обновляем статистику
        if (high24hEl) high24hEl.textContent = `$${pair.high24h.toLocaleString('en-US')}`;
        if (low24hEl) low24hEl.textContent = `$${pair.low24h.toLocaleString('en-US')}`;
        if (volume24hEl) volume24hEl.textContent = `${pair.volume24h.toLocaleString('en-US')} ${pair.baseCurrency}`;

        // Обновляем форму
        if (priceInput) {
            priceInput.value = pair.currentPrice;
            priceInput.placeholder = pair.currentPrice.toFixed(2);
        }

        const suffixes = document.querySelectorAll('.trading-input-suffix');
        if (suffixes[0]) suffixes[0].textContent = pair.quoteCurrency;
        if (suffixes[1]) suffixes[1].textContent = pair.baseCurrency;

        if (submitBtn) {
            submitBtn.textContent = tradeSide === 'buy' ? `Купить ${pair.baseCurrency}` : `Продать ${pair.baseCurrency}`;
        }

        // Обновляем баланс
        updateBalance();

        // Перерисовываем график
        drawChart();
    }

    // Обновление баланса
    function updateBalance() {
        const pair = tradingPairs[currentPair];
        const currency = tradeSide === 'buy' ? pair.quoteCurrency : pair.baseCurrency;
        const balance = userBalance[currency] || 0;

        if (availableBalance) {
            availableBalance.textContent = `${balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 8})} ${currency}`;
        }
    }

    // Расчет итого
    function calculateTotal() {
        const price = parseFloat(priceInput.value) || 0;
        const amount = parseFloat(amountInput.value) || 0;
        const total = price * amount;
        const pair = tradingPairs[currentPair];

        if (totalValue) {
            totalValue.textContent = total > 0 ? `${total.toFixed(2)} ${pair.quoteCurrency}` : `0.00 ${pair.quoteCurrency}`;
        }
    }

    // Обработчики Buy/Sell
    if (buyBtn) {
        buyBtn.addEventListener('click', () => {
            tradeSide = 'buy';
            buyBtn.classList.add('active');
            sellBtn.classList.remove('active');
            submitBtn.classList.remove('sell');
            submitBtn.classList.add('buy');
            updatePairUI();
        });
    }

    if (sellBtn) {
        sellBtn.addEventListener('click', () => {
            tradeSide = 'sell';
            sellBtn.classList.add('active');
            buyBtn.classList.remove('active');
            submitBtn.classList.remove('buy');
            submitBtn.classList.add('sell');
            updatePairUI();
        });
    }

    // Расчет при вводе
    if (priceInput) priceInput.addEventListener('input', calculateTotal);
    if (amountInput) amountInput.addEventListener('input', calculateTotal);

    // Кнопка MAX
    if (maxBtn) {
        maxBtn.addEventListener('click', () => {
            const pair = tradingPairs[currentPair];
            const price = parseFloat(priceInput.value) || pair.currentPrice;

            if (tradeSide === 'buy') {
                const usdtAmount = userBalance[pair.quoteCurrency] || 0;
                const baseAmount = usdtAmount / price;
                amountInput.value = baseAmount.toFixed(8);
            } else {
                const baseAmount = userBalance[pair.baseCurrency] || 0;
                amountInput.value = baseAmount.toFixed(8);
            }
            calculateTotal();
        });
    }

    // Процентные кнопки
    percentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const percent = parseInt(btn.dataset.percent) / 100;
            const pair = tradingPairs[currentPair];
            const price = parseFloat(priceInput.value) || pair.currentPrice;

            if (tradeSide === 'buy') {
                const usdtAmount = (userBalance[pair.quoteCurrency] || 0) * percent;
                const baseAmount = usdtAmount / price;
                amountInput.value = baseAmount.toFixed(8);
            } else {
                const baseAmount = (userBalance[pair.baseCurrency] || 0) * percent;
                amountInput.value = baseAmount.toFixed(8);
            }
            calculateTotal();
        });
    });

    // Отправка ордера
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const pair = tradingPairs[currentPair];
            const price = parseFloat(priceInput.value);
            const amount = parseFloat(amountInput.value);

            if (!price || price <= 0) {
                alert('Укажите корректную цену');
                return;
            }

            if (!amount || amount <= 0) {
                alert('Укажите корректное количество');
                return;
            }

            const total = price * amount;

            if (tradeSide === 'buy') {
                if (total > (userBalance[pair.quoteCurrency] || 0)) {
                    alert(`Недостаточно средств ${pair.quoteCurrency}`);
                    return;
                }
                userBalance[pair.quoteCurrency] -= total;
                userBalance[pair.baseCurrency] = (userBalance[pair.baseCurrency] || 0) + amount;
                alert(`Успешно куплено ${amount.toFixed(8)} ${pair.baseCurrency} за ${total.toFixed(2)} ${pair.quoteCurrency}`);
            } else {
                if (amount > (userBalance[pair.baseCurrency] || 0)) {
                    alert(`Недостаточно средств ${pair.baseCurrency}`);
                    return;
                }
                userBalance[pair.baseCurrency] -= amount;
                userBalance[pair.quoteCurrency] = (userBalance[pair.quoteCurrency] || 0) + total;
                alert(`Успешно продано ${amount.toFixed(8)} ${pair.baseCurrency} за ${total.toFixed(2)} ${pair.quoteCurrency}`);
            }

            // Очистка формы
            amountInput.value = '';
            calculateTotal();
            updatePairUI();
        });
    }

    // Модальное окно выбора пары
    function openPairModal() {
        renderPairList();
        pairModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closePairModal() {
        pairModal.classList.remove('active');
        document.body.style.overflow = '';
        pairSearch.value = '';
    }

    function renderPairList(searchTerm = '') {
        const filtered = Object.entries(tradingPairs).filter(([pair]) => {
            return pair.toLowerCase().includes(searchTerm.toLowerCase());
        });

        pairList.innerHTML = filtered.map(([pair, data]) => `
            <button class="currency-item ${pair === currentPair ? 'active' : ''}" data-pair="${pair}">
                <div class="currency-item-icon" style="background: linear-gradient(135deg, ${data.baseColor}, ${adjustColor(data.baseColor, -20)})">${data.baseIcon}</div>
                <div class="currency-item-info">
                    <div class="currency-item-code">${pair}</div>
                    <div class="currency-item-name">Спотовая торговля</div>
                </div>
                <div class="currency-item-balance ${data.change24h >= 0 ? 'positive' : 'negative'}">
                    ${data.change24h > 0 ? '+' : ''}${data.change24h.toFixed(2)}%
                </div>
            </button>
        `).join('');

        // Обработчики кликов
        pairList.querySelectorAll('.currency-item').forEach(item => {
            item.addEventListener('click', () => {
                currentPair = item.dataset.pair;
                updatePairUI();
                closePairModal();
            });
        });
    }

    // Функция для затемнения цвета
    function adjustColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.max(0, Math.min(255, (num >> 16) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
        const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }

    // Обработчики модального окна
    if (pairSelector) pairSelector.addEventListener('click', openPairModal);
    if (pairModalOverlay) pairModalOverlay.addEventListener('click', closePairModal);
    if (pairModalClose) pairModalClose.addEventListener('click', closePairModal);
    if (pairSearch) pairSearch.addEventListener('input', (e) => renderPairList(e.target.value));

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && pairModal.classList.contains('active')) {
            closePairModal();
        }
    });

    // Перерисовка графика при изменении размера окна
    window.addEventListener('resize', () => {
        drawChart();
    });

    // Перерисовка графика при изменении темы
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            setTimeout(drawChart, 100);
        });
    }

    // Массивы для хранения ордеров и истории (загружаем из localStorage)
    let openOrders = JSON.parse(localStorage.getItem('openOrders') || '[]');
    let tradeHistory = JSON.parse(localStorage.getItem('tradeHistory') || '[]');
    let orderIdCounter = Math.max(...tradeHistory.map(o => o.id || 0), 0) + 1;

    // Табы переключения
    const orderTabs = document.querySelectorAll('.trading-orders-tab');
    const orderContents = document.querySelectorAll('.trading-orders-content');

    orderTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            orderTabs.forEach(t => t.classList.remove('active'));
            orderContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetContent = targetTab === 'open'
                ? document.getElementById('openOrders')
                : document.getElementById('tradeHistory');
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // Рендер открытых ордеров (компактный вид)
    function renderOpenOrders() {
        const container = document.getElementById('openOrdersList');
        if (!container) return;

        const emptyState = container.parentElement.querySelector('.trading-orders-empty-state');

        if (openOrders.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        container.innerHTML = openOrders.slice(0, 5).map(order => {
            const sideClass = order.side === 'Покупка' ? 'buy' : 'sell';
            return `
                <div class="trading-order-item">
                    <div class="trading-order-row">
                        <span class="trading-order-pair">${order.pair}</span>
                        <span class="trading-order-value ${sideClass}">${order.side}</span>
                    </div>
                    <div class="trading-order-row">
                        <span class="trading-order-label">Цена:</span>
                        <span class="trading-order-value">$${order.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div class="trading-order-row">
                        <span class="trading-order-label">Количество:</span>
                        <span class="trading-order-value">${order.amount.toFixed(6)}</span>
                    </div>
                    <div class="trading-order-row">
                        <span class="trading-order-label">Заполнено:</span>
                        <button class="trading-order-cancel-btn" onclick="window.cancelOrder(${order.id})">Отменить</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Рендер истории сделок (компактный вид)
    function renderTradeHistory() {
        const container = document.getElementById('tradeHistoryList');
        if (!container) return;

        const emptyState = container.parentElement.querySelector('.trading-orders-empty-state');

        if (tradeHistory.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        container.innerHTML = tradeHistory.slice(0, 5).map(trade => {
            const sideText = trade.side === 'buy' ? 'Покупка' : trade.side === 'sell' ? 'Продажа' : trade.side;
            const sideClass = (trade.side === 'buy' || trade.side === 'Покупка') ? 'buy' : 'sell';
            const statusText = trade.status === 'completed' ? 'Выполнен' :
                             trade.status === 'cancelled' ? 'Отменён' : trade.statusText;

            return `
                <div class="trading-order-item">
                    <div class="trading-order-row">
                        <span class="trading-order-pair">${trade.pair}</span>
                        <span class="trading-order-value ${sideClass}">${sideText}</span>
                    </div>
                    <div class="trading-order-row">
                        <span class="trading-order-label">Цена:</span>
                        <span class="trading-order-value">$${parseFloat(trade.price).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div class="trading-order-row">
                        <span class="trading-order-label">Количество:</span>
                        <span class="trading-order-value">${parseFloat(trade.amount).toFixed(6)}</span>
                    </div>
                    <div class="trading-order-row">
                        <span class="trading-order-label">Статус:</span>
                        <span class="trading-order-value">${statusText}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Отмена ордера
    window.cancelOrder = function(orderId) {
        const orderIndex = openOrders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;

        const order = openOrders[orderIndex];

        // Возвращаем средства
        const pair = tradingPairs[order.pair];
        if (order.side === 'Покупка') {
            userBalance[pair.quoteCurrency] += order.total;
        } else {
            userBalance[pair.baseCurrency] += order.amount;
        }

        // Добавляем в историю как отменённый
        tradeHistory.unshift({
            ...order,
            status: 'cancelled',
            statusText: 'Отменён',
            fee: '0.00',
            feeCurrency: pair.quoteCurrency,
            timestamp: Date.now()
        });

        // Удаляем из открытых
        openOrders.splice(orderIndex, 1);

        // Сохраняем в localStorage
        localStorage.setItem('openOrders', JSON.stringify(openOrders));
        localStorage.setItem('tradeHistory', JSON.stringify(tradeHistory));

        renderOpenOrders();
        renderTradeHistory();
        updateBalance();

        alert(`Ордер #${orderId} отменён`);
    };

    // Добавление ордера при совершении сделки
    const originalSubmit = submitBtn.onclick;
    if (submitBtn) {
        submitBtn.onclick = null;
        submitBtn.addEventListener('click', () => {
            const pair = tradingPairs[currentPair];
            const price = parseFloat(priceInput.value);
            const amount = parseFloat(amountInput.value);

            if (!price || price <= 0) {
                alert('Укажите корректную цену');
                return;
            }

            if (!amount || amount <= 0) {
                alert('Укажите корректное количество');
                return;
            }

            const total = price * amount;
            const fee = total * 0.001; // 0.1% комиссия
            const now = new Date();
            const dateStr = now.toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            if (tradeSide === 'buy') {
                if (total > (userBalance[pair.quoteCurrency] || 0)) {
                    alert(`Недостаточно средств ${pair.quoteCurrency}`);
                    return;
                }
                userBalance[pair.quoteCurrency] -= total;
                userBalance[pair.baseCurrency] = (userBalance[pair.baseCurrency] || 0) + amount;

                // Добавляем в историю как выполненный
                tradeHistory.unshift({
                    id: 'TRD-' + Date.now() + '-' + orderIdCounter++,
                    date: dateStr,
                    pair: currentPair,
                    type: 'Limit',
                    side: 'buy',
                    price: price.toFixed(2),
                    amount: amount.toFixed(6),
                    total: total,
                    fee: fee.toFixed(4),
                    feeCurrency: pair.baseCurrency,
                    status: 'completed',
                    statusText: 'Выполнен',
                    filled: 100,
                    timestamp: Date.now()
                });

                // Сохраняем в localStorage
                localStorage.setItem('tradeHistory', JSON.stringify(tradeHistory));

                alert(`Успешно куплено ${amount.toFixed(8)} ${pair.baseCurrency} за ${total.toFixed(2)} ${pair.quoteCurrency}`);
            } else {
                if (amount > (userBalance[pair.baseCurrency] || 0)) {
                    alert(`Недостаточно средств ${pair.baseCurrency}`);
                    return;
                }
                userBalance[pair.baseCurrency] -= amount;
                userBalance[pair.quoteCurrency] = (userBalance[pair.quoteCurrency] || 0) + total;

                // Добавляем в историю как выполненный
                tradeHistory.unshift({
                    id: 'TRD-' + Date.now() + '-' + orderIdCounter++,
                    date: dateStr,
                    pair: currentPair,
                    type: 'Limit',
                    side: 'sell',
                    price: price.toFixed(2),
                    amount: amount.toFixed(6),
                    total: total,
                    fee: fee.toFixed(4),
                    feeCurrency: pair.quoteCurrency,
                    status: 'completed',
                    statusText: 'Выполнен',
                    filled: 100,
                    timestamp: Date.now()
                });

                // Сохраняем в localStorage
                localStorage.setItem('tradeHistory', JSON.stringify(tradeHistory));

                alert(`Успешно продано ${amount.toFixed(8)} ${pair.baseCurrency} за ${total.toFixed(2)} ${pair.quoteCurrency}`);
            }

            // Очистка формы
            amountInput.value = '';
            calculateTotal();
            updatePairUI();
            renderOpenOrders();
            renderTradeHistory();
        });
    }

    // Инициализация
    updatePairUI();
    renderOpenOrders();
    renderTradeHistory();
})();
