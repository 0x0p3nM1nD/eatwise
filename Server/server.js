const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./db');
const adminRoutes = require('./routes/adminRoutes');
require('dotenv').config();

const app = express();

// ==========================================
// 1. МИДЪЛУЕРИ И СТАТИЧНИ ФАЙЛОВЕ
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Обслужване на статични файлове
app.use(express.static(path.join(__dirname, '..')));

// Отчитане на посещения (Tracker)
app.use(async (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

    if (
        !req.url.startsWith('/favicon') &&
        !req.url.startsWith('/api/') &&
        !req.url.includes('.')
    ) {
        try {
            await db.execute(
                `INSERT INTO visits (ip_address, user_agent, endpoint) VALUES (?, ?, ?)`,
                [clientIp, req.headers['user-agent'] || '', req.url]
            );
        } catch (err) {
            console.error('Грешка при запис на посещение:', err.message);
        }
    }
    next();
});

// ==========================================
// 2. API РУТОВЕ (ВСИЧКИ API-ТА ТРЯБВА ДА СА ТУК)
// ==========================================


// API РУТ ЗА АДМИН ВХОД (ADMIN LOGIN)
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Моля, въведете потребителско име и парола.'
            });
        }

        // 1. Търсене на админа в базата данни
        const [rows] = await db.execute(
            'SELECT * FROM admins WHERE username = ?',
            [username.trim()]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Грешно потребителско име или парола.'
            });
        }

        const admin = rows[0];

        // 2. Сравняване на въведената парола с хешираната в DB
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Грешно потребителско име или парола.'
            });
        }

        return res.json({
            success: true,
            message: 'Успешен вход!',
            adminToken: 'eatwise-admin-authenticated-session'
        });

    } catch (err) {
        console.error('Грешка при админ вход:', err);
        return res.status(500).json({
            success: false,
            message: 'Сървърна грешка при опит за вход.'
        });
    }
});

// ==========================================
// 🟢 АДМИН: СМЯНА НА СТАТУС НА БИЗНЕС (Одобри / Отхвърли)
// ==========================================
app.put('/api/admin/business/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' или 'rejected'

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Невалиден статус.' });
        }

        await db.execute('UPDATE business SET status = ? WHERE id = ?', [status, id]);

        return res.json({
            success: true,
            message: `Статусът на бизнеса бе променен на ${status}.`
        });
    } catch (err) {
        console.error('Грешка при промяна на статус:', err);
        return res.status(500).json({ success: false, message: 'Сървърна грешка.' });
    }
});

// ==========================================
// 🟢 ВЗЕМАНЕ НА ВСИЧКИ БИЗНЕСИ (ЗА АДМИН ПАНЕЛА)
// ==========================================
app.get('/api/admin/businesses', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT id, business_name, category, address, phone, email, status, created_at 
            FROM business 
            ORDER BY id DESC
        `);
        return res.json({ success: true, businesses: rows });
    } catch (err) {
        console.error('Грешка при извличане на бизнеси:', err);
        return res.status(500).json({ success: false, message: 'Сървърна грешка.' });
    }
});

// ВХОД (LOGIN)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Моля, въведете имейл и парола.' });
        }

        // 1. Търсим бизнеса по имейл
        const [rows] = await db.execute('SELECT * FROM business WHERE email = ?', [email.trim()]);

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Грешен имейл или парола.' });
        }

        const user = rows[0];

        // 2. Сравняваме паролата с bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Грешен имейл или парола.' });
        }

        // 🔴 3. ПРОВЕРКА НА СТАТУСА НА БИЗНЕСА
        if (user.status === 'rejected') {
            return res.status(403).json({
                success: false,
                message: 'Вашият профил е отхвърлен от администратора. За повече информация се свържете с поддръжката.'
            });
        }

        if (user.status === 'pending') {
            return res.status(403).json({
                success: false,
                message: 'Вашият профил все още чака одобрение от администратор.'
            });
        }

        // 4. Успешен вход (само за approved бизнеси)
        return res.json({
            success: true,
            message: 'Успешен вход!',
            user: {
                id: user.id,
                email: user.email,
                businessName: user.business_name,
                category: user.category,
                status: user.status
            }
        });

    } catch (err) {
        console.error('Грешка при вход:', err);
        return res.status(500).json({ success: false, message: 'Сървърна грешка при опит за вход.' });
    }
});

// РЕГИСТРАЦИЯ НА БИЗНЕС (REGISTER)
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, businessName, phone, address, category } = req.body;

        if (!email || !password || !businessName || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Моля, попълнете всички задължителни полета.'
            });
        }

        // Валидация за мобилни, стационарни и +359 номера
        const cleanedPhone = phone ? phone.trim().replace(/[\s\-\(\)]/g, '') : '';
        const phoneRegex = /^(?:\+359|00359|0)[2-9]\d{6,8}$/;

        if (!phoneRegex.test(cleanedPhone)) {
            return res.status(400).json({
                success: false,
                message: 'Моля, въведете валиден български телефонен номер (мобилен, стационарен или с +359).'
            });
        }

        // Проверка дали вече съществува такъв имейл
        const [existing] = await db.execute('SELECT id FROM business WHERE email = ?', [email.trim()]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Вече съществува профил с този имейл.' });
        }

        // Хеширане на паролата за сигурност
        const hashedPassword = await bcrypt.hash(password, 10);

        // Запис в таблицата `business`
        const [result] = await db.execute(
            `INSERT INTO business (email, password, business_name, phone, address, category) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [email.trim(), hashedPassword, businessName, phone, address || '', category || '']
        );

        const newUser = {
            id: result.insertId,
            email,
            businessName,
            phone,
            address,
            category
        };

        return res.status(200).json({
            success: true,
            message: 'Регистрацията е успешна!',
            user: newUser
        });

    } catch (err) {
        console.error('Грешка при регистрация:', err);
        return res.status(500).json({
            success: false,
            message: 'Сървърна грешка при регистрация: ' + err.message
        });
    }
});

// РАБОТНО ВРЕМЕ
app.get('/api/business/working-hours/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT working_hours FROM business WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Бизнесът не е намерен.' });

        let workingHours = rows[0].working_hours;
        if (typeof workingHours === 'string') {
            try { workingHours = JSON.parse(workingHours); } catch (e) { workingHours = null; }
        }

        return res.json({ success: true, workingHours: workingHours || null });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Сървърна грешка при зареждане на часовете.' });
    }
});

app.post('/api/business/working-hours', async (req, res) => {
    try {
        const { businessId, workingHours } = req.body;
        if (!businessId || !workingHours) return res.status(400).json({ success: false, message: 'Невалидни данни.' });

        await db.execute('UPDATE business SET working_hours = ? WHERE id = ?', [JSON.stringify(workingHours), businessId]);
        return res.json({ success: true, message: 'Работното време беше запазено успешно!' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Сървърна грешка при запазване.' });
    }
});

// ТРАКВАНЕ НА ПОСЕЩЕНИЯ (POST /api/track-visit)
app.post('/api/track-visit', async (req, res) => {
    const { page } = req.body;
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    try {
        await db.execute(
            `INSERT INTO visits (ip_address, user_agent, endpoint) VALUES (?, ?, ?)`,
            [clientIp, userAgent, page || '/']
        );
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Грешка при запис от tracker:', err.message);
        res.status(500).json({ error: 'Грешка при запис' });
    }
});

// ИЗВЛИЧАНЕ НА БИЗНЕС ДАННИ
app.get('/api/business/:id', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, email, business_name, phone, address, category FROM business WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Бизнесът не е намерен.' });

        res.json({ success: true, business: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Сървърна грешка.' });
    }
});

// ОФЕРТИ
app.post('/api/offers', async (req, res) => {
    const { business_id, title, original_price, discount_price, pickup_start, pickup_end, quantity } = req.body;

    if (!business_id || !title || !original_price || !discount_price) {
        return res.status(400).json({ error: 'Моля, попълнете всички задължителни полета.' });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO offers (business_id, title, original_price, discount_price, pickup_start, pickup_end, quantity) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [business_id, title, original_price, discount_price, pickup_start, pickup_end, quantity || 1]
        );
        res.status(201).json({ success: true, offerId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Грешка при записване на офертата.' });
    }
});

app.get('/api/offers/search', async (req, res) => {
    const queryStr = req.query.q ? `%${req.query.q}%` : '%';
    const sql = `
        SELECT o.id, o.title, o.original_price, o.discount_price,
               TIME_FORMAT(o.pickup_start, '%H:%i') AS pickup_start,
               TIME_FORMAT(o.pickup_end, '%H:%i') AS pickup_end,
               o.quantity, b.business_name, b.address, b.category
        FROM offers o
        JOIN business b ON o.business_id = b.id
        WHERE o.is_active = TRUE AND (b.business_name LIKE ? OR b.category LIKE ? OR o.title LIKE ?)
        ORDER BY o.created_at DESC
    `;

    try {
        const [rows] = await db.execute(sql, [queryStr, queryStr, queryStr]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Грешка при извличане на офертите.' });
    }
});

// ==========================================
// 3. HTML РУТОВЕ (СТРАНИЦИ)
// ==========================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/business-auth', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'BussinesAuth', 'business-auth.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Dashboard', 'dashboard.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Admin', 'admin.html'));
});

// ПРОВЕРКА ДАЛИ ИМЕЙЛЪТ ВЕЧЕ СЪЩЕСТВУВА (За Стъпка 1)
app.post('/api/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Моля, въведете имейл.' });
        }

        const [existing] = await db.execute('SELECT id FROM business WHERE email = ?', [email.trim()]);

        if (existing.length > 0) {
            return res.json({ exists: true, message: 'Вече съществува акаунт с този имейл.' });
        }

        return res.json({ exists: false });
    } catch (err) {
        console.error('Грешка при проверка на имейл:', err);
        return res.status(500).json({ success: false, message: 'Сървърна грешка при проверка на имейла.' });
    }
});

// ==========================================
// 4. КРАЕН FALLBACK (ЗАДЪЛЖИТЕЛНО НАЙ-ОТДОЛУ)
// ==========================================

// Ако някой повика несъществуващ /api/... адрес
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'API адресът не е намерен.' });
});

// Всички останали липсващи HTML страници или файлове
app.use((req, res) => {
    if (req.path.includes('.')) {
        return res.status(404).send(`Файлът ${req.path} не е намерен.`);
    }
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ==========================================
// 5. СТАРТИРАНЕ НА СЪРВЪРА (НАЙ-НАКРАЯ)
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сървърът работи на порт ${PORT}`);
});