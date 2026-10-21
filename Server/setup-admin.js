const bcrypt = require('bcrypt');
const db = require('./db');

async function createOrUpdateAdmin(newUsername, newPassword) {
    try {
        // Хеширане на новата парола
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Изчистване на стари администратори и вкарване на новия
        await db.execute('DELETE FROM admins');
        await db.execute(
            'INSERT INTO admins (username, password) VALUES (?, ?)',
            [newUsername, hashedPassword]
        );

        console.log('✅ Админ профилът е обновен успешно с хеширана парола!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Грешка при създаване на админ:', err.message);
        process.exit(1);
    }
}

// ⚙️ ТУК ВЪВЕДЕТЕ НОВОТО ИМЕ И ПАРОЛА:
createOrUpdateAdmin('adminPAnCh0', 'AzObIcHaMpAnCh0');