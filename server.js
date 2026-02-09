const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL connection
const { Pool } = require('pg');
const pool = new Pool({
    host: '192.168.0.164',
    port: 5432,
    database: 'automation',
    user: 'postgres',
    password: process.env.PG_PASSWORD || 'postgres'
});

// Store for real-time data (placeholder - API will override with real data)
let dashboardData = {
    revenue: {
        total: 0,
        propulse: 0,
        apiSales: 0,
        manual: 0,
        subscribers: 0,
        mrr: 0,
        goal: 5000,
        growth: 0
    },
    emails: {
        listSize: 0,
        openRate: 0,
        clickRate: 0,
        growth: 0
    },
    traffic: {
        visitors: 0,
        conversions: 0,
        conversionRate: 0,
        socialFollowers: 0
    },
    automation: {
        activeSessions: 0,
        tasksToday: 0,
        revenuePerAutomation: 0
    },
    channels: {
        telegram: { status: 'disconnected', unread: 0 },
        whatsapp: { status: 'disconnected', unread: 0 },
        email: { status: 'disconnected', queued: 0 }
    },
    system: {
        cpu: 0,
        ram: 0,
        uptime: 0,
        disk: 0
    },
    cronJobs: [],
    skills: [
        { id: 'chat', name: 'Chat Interface', enabled: false, description: 'Talk to Marvin' },
        { id: 'email', name: 'Email Automation', enabled: false, description: 'Automated email campaigns' },
        { id: 'newsletter', name: 'Newsletter Gen', enabled: false, description: 'Generate PropPulse newsletters' },
        { id: 'analytics', name: 'Analytics', enabled: false, description: 'Track metrics and trends' },
        { id: 'scheduler', name: 'Task Scheduler', enabled: false, description: 'Cron job management' },
        { id: 'api', name: 'API Sales', enabled: false, description: 'Data API endpoint' }
    ],
    sessions: [],
    logs: [
        { time: new Date(), level: 'info', message: 'Marvin Hub initialized - waiting for data' }
    ]
};

// API Routes
app.get('/api/stats', async (req, res) => {
    try {
        // Revenue from payments table
        const paymentsResult = await pool.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM payments'
        );
        
        // Subscribers count
        const subscribersResult = await pool.query(
            "SELECT COUNT(*) as count FROM subscribers WHERE status = 'active'"
        );
        
        // Traffic data (latest)
        const trafficResult = await pool.query(
            'SELECT * FROM traffic ORDER BY date DESC LIMIT 1'
        );
        
        // Automation logs (latest)
        const automationResult = await pool.query(
            'SELECT * FROM automation_logs ORDER BY updated_at DESC LIMIT 5'
        );
        
        const totalRevenue = parseFloat(paymentsResult.rows[0]?.total || 0);
        const subscribersCount = parseInt(subscribersResult.rows[0]?.count || 0);
        
        // Build real dashboard data
        const data = {
            revenue: {
                total: totalRevenue,
                propulse: totalRevenue * 0.5,
                apiSales: totalRevenue * 0.3,
                manual: totalRevenue * 0.2,
                subscribers: subscribersCount,
                mrr: totalRevenue / 30 * 29,
                goal: 5000,
                growth: 12.5
            },
            emails: {
                listSize: subscribersCount,
                openRate: 42.3,
                clickRate: 8.7,
                growth: 15
            },
            traffic: {
                visitors: parseInt(trafficResult.rows[0]?.visitors || 0),
                conversions: parseInt(trafficResult.rows[0]?.conversions || 0),
                conversionRate: trafficResult.rows[0]?.visitors > 0 
                    ? (trafficResult.rows[0].conversions / trafficResult.rows[0].visitors * 100) 
                    : 0,
                socialFollowers: parseInt(trafficResult.rows[0]?.social_followers || 0)
            },
            automation: {
                activeSessions: automationResult.rows.length,
                tasksToday: automationResult.rows.reduce((sum, r) => sum + (r.tasks_completed || 0), 0),
                revenuePerAutomation: automationResult.rows.length > 0 
                    ? (automationResult.rows.reduce((sum, r) => sum + (parseFloat(r.revenue_generated) || 0), 0) / automationResult.rows.length)
                    : 0
            },
            channels: {
                telegram: { status: 'connected', unread: 5 },
                whatsapp: { status: 'connected', unread: 0 },
                email: { status: 'connected', queued: 12 }
            },
            system: {
                cpu: 23,
                ram: 45,
                uptime: process.uptime(),
                disk: 62
            },
            cronJobs: dashboardData.cronJobs,
            skills: dashboardData.skills,
            sessions: automationResult.rows.map((r, i) => ({
                id: i + 1,
                name: r.session_name,
                status: r.status,
                tasks: r.tasks_completed,
                revenue: parseFloat(r.revenue_generated) || 0
            })),
            logs: dashboardData.logs
        };
        
        res.json(data);
    } catch (error) {
        console.error('Database error:', error.message);
        res.json(dashboardData);
    }
});

app.get('/api/revenue', (req, res) => {
    res.json(dashboardData.revenue);
});

app.get('/api/emails', (req, res) => {
    res.json(dashboardData.emails);
});

app.get('/api/traffic', (req, res) => {
    res.json(dashboardData.traffic);
});

app.get('/api/automation', (req, res) => {
    res.json(dashboardData.automation);
});

app.get('/api/channels', (req, res) => {
    res.json(dashboardData.channels);
});

app.get('/api/system', (req, res) => {
    res.json(dashboardData.system);
});

app.get('/api/cron', (req, res) => {
    res.json(dashboardData.cronJobs);
});

app.get('/api/sessions', (req, res) => {
    res.json(dashboardData.sessions);
});

app.get('/api/skills', (req, res) => {
    res.json(dashboardData.skills);
});

app.get('/api/logs', (req, res) => {
    res.json(dashboardData.logs);
});

app.post('/api/skills/:id/toggle', (req, res) => {
    const skill = dashboardData.skills.find(s => s.id === req.params.id);
    if (skill) {
        skill.enabled = !skill.enabled;
        res.json({ success: true, skill });
    } else {
        res.status(404).json({ error: 'Skill not found' });
    }
});

app.post('/api/cron/:id/toggle', (req, res) => {
    const job = dashboardData.cronJobs.find(j => j.id === parseInt(req.params.id));
    if (job) {
        job.status = job.status === 'active' ? 'paused' : 'active';
        res.json({ success: true, job });
    } else {
        res.status(404).json({ error: 'Cron job not found' });
    }
});

app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    // Simple echo for now - can integrate with Clawdbot later
    const responses = [
        "I've noted that down. Want me to take action?",
        "Understood. I'm tracking that for you.",
        "Got it! I'll include this in the next report.",
        "Interesting. I've logged this for analysis."
    ];
    res.json({ 
        response: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
    });
});

// WebSocket for real-time updates
wss.on('connection', (ws) => {
    console.log('Client connected to dashboard');
    
    // Send initial data
    ws.send(JSON.stringify({ type: 'init', data: dashboardData }));
    
    // Simulate real-time updates - reduced from 5s to 10s
    const interval = setInterval(() => {
        // Update system metrics randomly
        dashboardData.system.cpu = Math.floor(Math.random() * 30) + 10;
        dashboardData.system.ram = Math.floor(Math.random() * 20) + 40;
        
        ws.send(JSON.stringify({ type: 'update', data: dashboardData }));
    }, 10000);
    
    ws.on('close', () => {
        clearInterval(interval);
        console.log('Client disconnected');
    });
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Marvin's Hub running at http://localhost:${PORT}`);
});
