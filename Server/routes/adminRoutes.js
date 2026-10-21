const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. Статистика за админ таблото
router.get('/stats', async (req, res) => {
    try {
        const [[{ total_businesses }]] = await db.execute(`SELECT COUNT(*) AS total_businesses FROM businesses`);
        const [[{ total_offers }]] = await db.execute(`SELECT COUNT(*) AS total_offers FROM offers`);
        const [[{ active_offers }]] = await db.execute(`SELECT COUNT(*) AS active_offers FROM offers WHERE is_active = TRUE`);
        const [[{ total_visits }]] = await db.execute(`SELECT COUNT(*) AS total_visits FROM visits`);
        const [[{ unique_ips }]] = await db.execute(`SELECT COUNT(DISTINCT ip_address) AS unique_ips FROM visits`);

        res.json({ total_businesses, total_offers, active_offers, total_visits, unique_ips });
    } catch (error) {
        res.status(500).json({ error: 'Грешка при извличане на статистиката.' });
    }
});

// 2. Вземане на активните IP адреси и посещения
router.get('/visits', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT ip_address, endpoint, user_agent, DATE_FORMAT(created_at, '%d.%m.%Y %H:%i:%s') AS visit_time 
            FROM visits 
            ORDER BY created_at DESC 
            LIMIT 50
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Грешка при извличане на посещенията.' });
    }
});

// 3. Извличане на всички бизнеси
router.get('/businesses', async (req, res) => {
    try {
        const [businesses] = await db.execute(`
            SELECT id, name, email, phone, created_at 
            FROM businesses 
            ORDER BY id DESC
        `);
        res.json(businesses);
    } catch (error) {
        console.error('Грешка при извличане на бизнесите:', error);
        res.status(500).json({ error: 'Грешка при извличане на бизнесите.' });
    }
});

// Изтриване на бизнес по ID
router.delete('/businesses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute(`DELETE FROM businesses WHERE id = ?`, [id]);
        res.json({ success: true, message: 'Бизнесът е изтрит успешно.' });
    } catch (error) {
        console.error('Грешка при изтриване на бизнес:', error);
        res.status(500).json({ error: 'Грешка при изтриване на бизнеса.' });
    }
});
module.exports = router;