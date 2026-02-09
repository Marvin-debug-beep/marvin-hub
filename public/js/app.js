// Marvin's Hub - Main Application JavaScript
// All dashboard functionality

// Global state
let dashboardData = null;
let charts = {};
let ws = null;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadDashboardData();
    initWebSocket();
    initCharts();
    startAutoRefresh();
});

// Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            navigateTo(section);
        });
    });
}

function navigateTo(section) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Update section
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${section}-section`).classList.add('active');
    
    // Update title
    const titles = {
        overview: 'Overview',
        revenue: 'Revenue Tracking',
        email: 'Email Metrics',
        traffic: 'Traffic & Analytics',
        automation: 'Automation Status',
        chat: 'Chat with Marvin',
        channels: 'Channel Status',
        scheduler: 'Task Scheduler',
        skills: 'Skills & Capabilities',
        security: 'Security Controls',
        logs: 'Live Activity Log',
        settings: 'Configuration'
    };
    document.getElementById('page-title').textContent = titles[section] || section;
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch('/api/stats');
        dashboardData = await response.json();
        updateDashboard();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function updateDashboard() {
    if (!dashboardData) return;
    
    updateStats();
    updateRevenue();
    updateEmail();
    updateTraffic();
    updateAutomation();
    updateChannels();
    updateSessions();
    updateCronJobs();
    updateSkills();
    updateLogs();
}

function updateStats() {
    document.getElementById('total-revenue').textContent = `$${dashboardData.revenue.total.toLocaleString()}`;
    document.getElementById('email-list').textContent = dashboardData.revenue.subscribers.toLocaleString();
    document.getElementById('visitors').textContent = dashboardData.traffic.visitors.toLocaleString();
    document.getElementById('tasks-today').textContent = dashboardData.automation.tasksToday;
}

function updateRevenue() {
    document.getElementById('rev-total').textContent = `$${dashboardData.revenue.total.toLocaleString()}`;
    document.getElementById('rev-propulse').textContent = `$${dashboardData.revenue.propulse.toLocaleString()}`;
    document.getElementById('rev-api').textContent = `$${dashboardData.revenue.apiSales.toLocaleString()}`;
    document.getElementById('rev-manual').textContent = `$${dashboardData.revenue.manual.toLocaleString()}`;
    document.getElementById('rev-subs').textContent = dashboardData.revenue.subscribers;
    
    const progress = (dashboardData.revenue.total / dashboardData.revenue.goal) * 100;
    document.getElementById('goal-progress-bar').style.width = `${Math.min(progress, 100)}%`;
}

function updateEmail() {
    document.getElementById('email-list-size').textContent = dashboardData.emails.listSize.toLocaleString();
    document.getElementById('open-rate').textContent = `${dashboardData.emails.openRate}%`;
    document.getElementById('click-rate').textContent = `${dashboardData.emails.clickRate}%`;
    document.getElementById('email-growth').textContent = `+${dashboardData.emails.growth}%`;
}

function updateTraffic() {
    document.getElementById('traffic-visitors').textContent = dashboardData.traffic.visitors.toLocaleString();
    document.getElementById('traffic-conversions').textContent = dashboardData.traffic.conversions;
    document.getElementById('traffic-rate').textContent = `${dashboardData.traffic.conversionRate}%`;
    document.getElementById('social-followers').textContent = dashboardData.traffic.socialFollowers.toLocaleString();
}

function updateAutomation() {
    document.getElementById('active-sessions').textContent = dashboardData.automation.activeSessions;
    document.getElementById('tasks-completed').textContent = dashboardData.automation.tasksToday;
    document.getElementById('revenue-per-auto').textContent = `$${dashboardData.automation.revenuePerAutomation.toLocaleString()}`;
}

function updateChannels() {
    const grid = document.getElementById('channels-grid');
    const detail = document.getElementById('channels-detail');
    
    // Update channels grid
    grid.innerHTML = Object.entries(dashboardData.channels).map(([name, data]) => `
        <div class="channel-item">
            <span class="channel-icon">${name === 'telegram' ? '📱' : name === 'whatsapp' ? '💬' : '📧'}</span>
            <div class="channel-info">
                <div class="channel-name">${name.charAt(0).toUpperCase() + name.slice(1)}</div>
                <div class="channel-status">${data.status}</div>
            </div>
            <span class="channel-badge ${data.unread > 0 ? 'unread' : 'connected'}">
                ${data.unread > 0 ? `${data.unread} unread` : 'connected'}
            </span>
        </div>
    `).join('');
    
    // Update detail view
    detail.innerHTML = Object.entries(dashboardData.channels).map(([name, data]) => `
        <div class="channel-detail-card">
            <div class="channel-header">
                <div class="channel-detail-icon ${name}">
                    ${name === 'telegram' ? '📱' : name === 'whatsapp' ? '💬' : '📧'}
                </div>
                <div>
                    <div class="channel-detail-name">${name.charAt(0).toUpperCase() + name.slice(1)}</div>
                    <div class="channel-detail-status">${data.status}</div>
                </div>
            </div>
            <div class="channel-metrics">
                <div class="metric">
                    <div class="metric-value">${data.unread || 0}</div>
                    <div class="metric-label">Unread</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${data.queued || 0}</div>
                    <div class="metric-label">Queued</div>
                </div>
            </div>
        </div>
    `).join('');
}

function updateSessions() {
    const list = document.getElementById('sessions-list');
    const automation = document.getElementById('automation-sessions');
    
    list.innerHTML = dashboardData.sessions.map(s => `
        <div class="session-item">
            <div class="session-icon running">⚡</div>
            <div class="session-info">
                <div class="session-name">${s.name}</div>
                <div class="session-stats">${s.tasks} tasks • $${s.revenue} revenue</div>
            </div>
            <span class="session-status running">${s.status}</span>
        </div>
    `).join('');
    
    automation.innerHTML = dashboardData.sessions.map(s => `
        <div class="session-item">
            <div class="session-icon running">⚡</div>
            <div class="session-info">
                <div class="session-name">${s.name}</div>
                <div class="session-stats">${s.tasks} tasks completed</div>
            </div>
            <span class="session-status running">${s.status}</span>
        </div>
    `).join('');
}

function updateCronJobs() {
    const tbody = document.getElementById('cron-jobs-body');
    tbody.innerHTML = dashboardData.cronJobs.map(job => `
        <tr>
            <td><span class="cron-status ${job.status}">${job.status}</span></td>
            <td>${job.name}</td>
            <td>${job.schedule}</td>
            <td>${new Date(job.lastRun).toLocaleString()}</td>
            <td>
                <button class="toggle-btn" onclick="toggleCron(${job.id})">
                    ${job.status === 'active' ? 'Pause' : 'Activate'}
                </button>
            </td>
        </tr>
    `).join('');
}

function updateSkills() {
    const grid = document.getElementById('skills-grid');
    grid.innerHTML = dashboardData.skills.map(skill => `
        <div class="skill-card ${skill.enabled ? '' : 'disabled'}">
            <div class="skill-header">
                <span class="skill-icon">${getSkillIcon(skill.id)}</span>
                <label class="skill-toggle">
                    <input type="checkbox" ${skill.enabled ? 'checked' : ''} onchange="toggleSkill('${skill.id}')">
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="skill-name">${skill.name}</div>
            <div class="skill-description">${skill.description}</div>
            <span class="skill-status ${skill.enabled ? 'enabled' : 'disabled'}">
                ${skill.enabled ? 'Enabled' : 'Disabled'}
            </span>
        </div>
    `).join('');
}

function getSkillIcon(id) {
    const icons = {
        chat: '💬',
        email: '📧',
        newsletter: '📰',
        analytics: '📊',
        scheduler: '⏰',
        api: '🔌'
    };
    return icons[id] || '🧩';
}

function updateLogs() {
    const container = document.getElementById('logs-container');
    container.innerHTML = dashboardData.logs.map(log => `
        <div class="log-entry">
            <span class="log-time">${new Date(log.time).toLocaleTimeString()}</span>
            <span class="log-level ${log.level}">${log.level.toUpperCase()}</span>
            <span class="log-message">${log.message}</span>
        </div>
    `).join('');
    
    // Update activity log too
    const activityLog = document.getElementById('activity-log');
    activityLog.innerHTML = dashboardData.logs.slice(0, 5).map(log => `
        <div class="activity-item">
            <span class="activity-icon ${log.level}">
                ${log.level === 'success' ? '✓' : log.level === 'warning' ? '!' : log.level === 'error' ? '✕' : 'i'}
            </span>
            <span class="activity-text">${log.message}</span>
            <span class="activity-time">${getRelativeTime(log.time)}</span>
        </div>
    `).join('');
}

function getRelativeTime(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

// WebSocket for real-time updates
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'init' || data.type === 'update') {
            dashboardData = data.data;
            updateDashboard();
            updateCharts();
        }
    };
}

// Charts
function initCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded');
        return;
    }
    
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        charts.revenue = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Revenue',
                    data: [320, 450, 380, 520, 490, 610, 580],
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#888' } },
                    x: { grid: { display: false }, ticks: { color: '#888' } }
                }
            }
        });
    }
    
    // Distribution Chart
    const distCtx = document.getElementById('distributionChart');
    if (distCtx) {
        charts.distribution = new Chart(distCtx, {
            type: 'doughnut',
            data: {
                labels: ['PropPulse', 'API Sales', 'Manual'],
                datasets: [{
                    data: [2100, 1275, 875],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#888' } } }
            }
        });
    }
    
    // List Growth Chart
    const listCtx = document.getElementById('listGrowthChart');
    if (listCtx) {
        charts.listGrowth = new Chart(listCtx, {
            type: 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Subscribers',
                    data: [1500, 1650, 1720, 1847],
                    backgroundColor: '#00ff88'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#888' } },
                    x: { grid: { display: false }, ticks: { color: '#888' } }
                }
            }
        });
    }
    
    // Revenue History Chart
    const historyCtx = document.getElementById('revenueHistoryChart');
    if (historyCtx) {
        charts.history = new Chart(historyCtx, {
            type: 'bar',
            data: {
                labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
                datasets: [{
                    label: 'Revenue',
                    data: [2100, 2450, 2890, 3200, 3850, 4250],
                    backgroundColor: '#00ff88'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#888' } },
                    x: { grid: { display: false }, ticks: { color: '#888' } }
                }
            }
        });
    }
}

function updateCharts() {
    if (charts.revenue) charts.revenue.update();
    if (charts.distribution) charts.distribution.update();
    if (charts.listGrowth) charts.listGrowth.update();
    if (charts.history) charts.history.update();
}

// Auto refresh - reduced from 10s to 30s for better performance
function startAutoRefresh() {
    setInterval(() => {
        loadDashboardData();
    }, 30000);
}

// Actions
async function toggleSkill(id) {
    try {
        const response = await fetch(`/api/skills/${id}/toggle`, { method: 'POST' });
        const result = await response.json();
        if (result.success) {
            loadDashboardData();
        }
    } catch (error) {
        console.error('Error toggling skill:', error);
    }
}

async function toggleCron(id) {
    try {
        const response = await fetch(`/api/cron/${id}/toggle`, { method: 'POST' });
        const result = await response.json();
        if (result.success) {
            loadDashboardData();
        }
    } catch (error) {
        console.error('Error toggling cron:', error);
    }
}

// Chat
function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    addChatMessage('user', message);
    input.value = '';
    
    // Simulate response
    setTimeout(() => {
        const responses = [
            "I've noted that down. Want me to take action?",
            "Understood. I'm tracking that for you.",
            "Got it! I'll include this in the next report.",
            "Interesting. I've logged this for analysis."
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage('bot', response);
    }, 1000);
}

function addChatMessage(type, text) {
    const container = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <div class="message-avatar">${type === 'bot' ? 'M' : 'U'}</div>
        <div class="message-content">
            <div class="message-text">${text}</div>
            <div class="message-time">Just now</div>
        </div>
    `;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function quickAction(action) {
    document.getElementById('chat-input').value = action;
    sendMessage();
}

function clearLogs() {
    dashboardData.logs = [];
    updateLogs();
}

function refreshRevenue() {
    loadDashboardData();
}

// Keyboard shortcuts
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'chat-input') {
        sendMessage();
    }
});
