// Orders page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load orders from localStorage
    let openOrders = JSON.parse(localStorage.getItem('openOrders') || '[]');
    let tradeHistory = JSON.parse(localStorage.getItem('tradeHistory') || '[]');

    // Current filter state
    let currentFilters = {
        period: 'all',
        pair: 'all',
        side: 'all'
    };

    // Tab elements
    const openOrdersTab = document.getElementById('openOrdersTab');
    const historyTab = document.getElementById('historyTab');
    const openOrdersView = document.getElementById('openOrdersView');
    const historyView = document.getElementById('historyView');

    // Filter elements
    const periodFilter = document.getElementById('periodFilter');
    const pairFilter = document.getElementById('pairFilter');
    const sideFilter = document.getElementById('sideFilter');

    // Stats elements
    const openOrdersCount = document.getElementById('openOrdersCount');
    const totalTradesCount = document.getElementById('totalTradesCount');
    const totalVolumeValue = document.getElementById('totalVolumeValue');

    // Table bodies
    const openOrdersTableBody = document.getElementById('openOrdersTableBody');
    const historyTableBody = document.getElementById('historyTableBody');

    // Tab switching
    openOrdersTab.addEventListener('click', function() {
        openOrdersTab.classList.add('active');
        historyTab.classList.remove('active');
        openOrdersView.classList.add('active');
        historyView.classList.remove('active');
    });

    historyTab.addEventListener('click', function() {
        historyTab.classList.add('active');
        openOrdersTab.classList.remove('active');
        historyView.classList.add('active');
        openOrdersView.classList.remove('active');
    });

    // Filter change handlers
    periodFilter.addEventListener('change', function() {
        currentFilters.period = this.value;
        applyFilters();
    });

    pairFilter.addEventListener('change', function() {
        currentFilters.pair = this.value;
        applyFilters();
    });

    sideFilter.addEventListener('change', function() {
        currentFilters.side = this.value;
        applyFilters();
    });

    // Apply filters to data
    function applyFilters() {
        renderOpenOrders(filterOrders(openOrders));
        renderTradeHistory(filterOrders(tradeHistory));
    }

    // Filter orders based on current filters
    function filterOrders(orders) {
        return orders.filter(order => {
            // Filter by pair
            if (currentFilters.pair !== 'all' && order.pair !== currentFilters.pair) {
                return false;
            }

            // Filter by side
            if (currentFilters.side !== 'all' && order.side !== currentFilters.side) {
                return false;
            }

            // Filter by period
            if (currentFilters.period !== 'all') {
                const orderDate = new Date(order.timestamp);
                const now = new Date();
                const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

                switch (currentFilters.period) {
                    case 'today':
                        if (daysDiff > 0) return false;
                        break;
                    case 'week':
                        if (daysDiff > 7) return false;
                        break;
                    case 'month':
                        if (daysDiff > 30) return false;
                        break;
                }
            }

            return true;
        });
    }

    // Render open orders
    function renderOpenOrders(orders) {
        if (!openOrdersTableBody) return;

        if (orders.length === 0) {
            openOrdersTableBody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 48px; color: var(--text-muted);">
                        Нет открытых ордеров
                    </td>
                </tr>
            `;
            return;
        }

        openOrdersTableBody.innerHTML = orders.map(order => {
            const sideClass = order.side === 'buy' ? 'buy' : 'sell';
            const sideText = order.side === 'buy' ? 'Покупка' : 'Продажа';
            const date = new Date(order.timestamp);
            const filled = order.filled || 0;
            const filledPercent = ((filled / order.amount) * 100).toFixed(0);

            return `
                <tr>
                    <td>${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td><strong>${order.pair}</strong></td>
                    <td><span class="orders-status-badge ${sideClass}">${sideText}</span></td>
                    <td>Лимит</td>
                    <td class="text-right">${parseFloat(order.price).toFixed(2)}</td>
                    <td class="text-right">${parseFloat(order.amount).toFixed(6)}</td>
                    <td class="text-right">${filled.toFixed(6)}</td>
                    <td class="text-right">${(parseFloat(order.amount) * parseFloat(order.price)).toFixed(2)}</td>
                    <td>
                        <div class="orders-progress">
                            <div class="orders-progress-bar ${sideClass}" style="width: ${filledPercent}%"></div>
                            <span class="orders-progress-text">${filledPercent}%</span>
                        </div>
                    </td>
                    <td>
                        <button class="orders-action-btn cancel" onclick="cancelOrder('${order.id}')">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            Отменить
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Render trade history
    function renderTradeHistory(trades) {
        if (!historyTableBody) return;

        if (trades.length === 0) {
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 48px; color: var(--text-muted);">
                        Нет истории сделок
                    </td>
                </tr>
            `;
            return;
        }

        historyTableBody.innerHTML = trades.map(trade => {
            const sideClass = trade.side === 'buy' ? 'buy' : 'sell';
            const sideText = trade.side === 'buy' ? 'Покупка' : 'Продажа';
            const statusClass = trade.status === 'completed' ? 'success' :
                              trade.status === 'cancelled' ? 'cancelled' : 'pending';
            const statusText = trade.status === 'completed' ? 'Выполнен' :
                             trade.status === 'cancelled' ? 'Отменён' : 'В обработке';
            const date = new Date(trade.timestamp);
            const fee = (parseFloat(trade.amount) * parseFloat(trade.price) * 0.001).toFixed(2);

            return `
                <tr>
                    <td>${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td><strong>${trade.pair}</strong></td>
                    <td><span class="orders-status-badge ${sideClass}">${sideText}</span></td>
                    <td>Лимит</td>
                    <td class="text-right">${parseFloat(trade.price).toFixed(2)}</td>
                    <td class="text-right">${parseFloat(trade.amount).toFixed(6)}</td>
                    <td class="text-right">${parseFloat(trade.amount).toFixed(6)}</td>
                    <td class="text-right">${(parseFloat(trade.amount) * parseFloat(trade.price)).toFixed(2)}</td>
                    <td class="text-right">${fee}</td>
                    <td><span class="orders-status-badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        }).join('');
    }

    // Update statistics
    function updateStats() {
        // Open orders count
        openOrdersCount.textContent = openOrders.length;

        // Total trades count (only completed)
        const completedTrades = tradeHistory.filter(t => t.status === 'completed').length;
        totalTradesCount.textContent = completedTrades;

        // Total volume (in USDT)
        const totalVolume = tradeHistory
            .filter(t => t.status === 'completed')
            .reduce((sum, trade) => {
                return sum + (parseFloat(trade.amount) * parseFloat(trade.price));
            }, 0);
        totalVolumeValue.textContent = totalVolume.toLocaleString('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + ' USDT';
    }

    // Cancel order function
    window.cancelOrder = function(orderId) {
        const orderIndex = openOrders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;

        const order = openOrders[orderIndex];

        // Move to history with cancelled status
        tradeHistory.unshift({
            ...order,
            status: 'cancelled',
            timestamp: Date.now()
        });

        // Remove from open orders
        openOrders.splice(orderIndex, 1);

        // Save to localStorage
        localStorage.setItem('openOrders', JSON.stringify(openOrders));
        localStorage.setItem('tradeHistory', JSON.stringify(tradeHistory));

        // Update UI
        updateStats();
        applyFilters();
    };

    // Generate sample data if none exists
    function generateSampleData() {
        if (openOrders.length === 0 && tradeHistory.length === 0) {
            const pairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT'];
            const sides = ['buy', 'sell'];

            // Generate 5 open orders
            for (let i = 0; i < 5; i++) {
                const pair = pairs[Math.floor(Math.random() * pairs.length)];
                const side = sides[Math.floor(Math.random() * sides.length)];
                const price = side === 'buy' ?
                    (pair === 'BTC/USDT' ? 65000 + Math.random() * 1000 : 3200 + Math.random() * 100) :
                    (pair === 'BTC/USDT' ? 66000 + Math.random() * 1000 : 3300 + Math.random() * 100);
                const amount = pair.includes('BTC') ?
                    0.01 + Math.random() * 0.1 :
                    0.1 + Math.random() * 1;

                openOrders.push({
                    id: 'ORD-' + Date.now() + '-' + i,
                    pair: pair,
                    side: side,
                    price: price.toFixed(2),
                    amount: amount.toFixed(6),
                    filled: (amount * Math.random() * 0.3).toFixed(6),
                    timestamp: Date.now() - Math.random() * 86400000 * 2 // Last 2 days
                });
            }

            // Generate 15 historical trades
            for (let i = 0; i < 15; i++) {
                const pair = pairs[Math.floor(Math.random() * pairs.length)];
                const side = sides[Math.floor(Math.random() * sides.length)];
                const price = pair === 'BTC/USDT' ?
                    64000 + Math.random() * 3000 :
                    3100 + Math.random() * 300;
                const amount = pair.includes('BTC') ?
                    0.01 + Math.random() * 0.1 :
                    0.1 + Math.random() * 1;
                const status = Math.random() > 0.1 ? 'completed' : 'cancelled';

                tradeHistory.push({
                    id: 'TRD-' + Date.now() + '-' + i,
                    pair: pair,
                    side: side,
                    price: price.toFixed(2),
                    amount: amount.toFixed(6),
                    status: status,
                    timestamp: Date.now() - Math.random() * 86400000 * 30 // Last 30 days
                });
            }

            // Sort history by timestamp descending
            tradeHistory.sort((a, b) => b.timestamp - a.timestamp);

            // Save to localStorage
            localStorage.setItem('openOrders', JSON.stringify(openOrders));
            localStorage.setItem('tradeHistory', JSON.stringify(tradeHistory));
        }
    }

    // Initialize
    generateSampleData();
    updateStats();
    applyFilters();

    // Listen for storage changes (when orders are created from trading page)
    window.addEventListener('storage', function(e) {
        if (e.key === 'openOrders') {
            openOrders = JSON.parse(e.newValue || '[]');
            updateStats();
            applyFilters();
        } else if (e.key === 'tradeHistory') {
            tradeHistory = JSON.parse(e.newValue || '[]');
            updateStats();
            applyFilters();
        }
    });

    // Reload data every 5 seconds
    setInterval(function() {
        openOrders = JSON.parse(localStorage.getItem('openOrders') || '[]');
        tradeHistory = JSON.parse(localStorage.getItem('tradeHistory') || '[]');
        updateStats();
        applyFilters();
    }, 5000);
});
