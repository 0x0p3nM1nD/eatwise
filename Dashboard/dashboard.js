document.addEventListener('DOMContentLoaded', async () => {
    // 1. Извличане на потребител от localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '/BussinesAuth/business-auth.html';
        return;
    }

    const user = JSON.parse(userStr);

    // 2. Попълване на профилни данни
    const name = user.businessName || user.business_name || user.email || 'Бизнес';
    const email = user.email || '-';
    const phone = user.phone || '-';
    const category = user.category || '-';
    const address = user.address || '-';

    const welcomeElem = document.getElementById('dash-welcome-name');
    if (welcomeElem) welcomeElem.innerText = name;
    
    document.getElementById('dash-business-name').innerText = name;
    document.getElementById('dash-email').innerText = email;
    document.getElementById('dash-phone').innerText = phone;
    document.getElementById('dash-category').innerText = category;
    document.getElementById('dash-address').innerText = address;

    // Изход
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.href = '/BussinesAuth/business-auth.html';
        });
    }

    // ==========================================
    // 3. ПАДАЩИ МЕНЮТА ЗА РАБОТНО ВРЕМЕ
    // ==========================================
    const days = [
        { key: 'mon', label: 'Понеделник' },
        { key: 'tue', label: 'Вторник' },
        { key: 'wed', label: 'Сряда' },
        { key: 'thu', label: 'Четвъртък' },
        { key: 'fri', label: 'Петък' },
        { key: 'sat', label: 'Събота' },
        { key: 'sun', label: 'Неделя' }
    ];

    const container = document.getElementById('hours-container');
    const form = document.getElementById('working-hours-form');
    const statusMsg = document.getElementById('hours-status-msg');
    const copyMonBtn = document.getElementById('copy-mon-btn');

    // Функция за генериране на падащи опции през 30 минути (00:00 - 23:30)
    function generateTimeOptions(selectedValue) {
        let options = '';
        for (let h = 0; h < 24; h++) {
            for (let m of [0, 30]) {
                const hourStr = h.toString().padStart(2, '0');
                const minStr = m.toString().padStart(2, '0');
                const timeStr = `${hourStr}:${minStr}`;
                const isSelected = timeStr === selectedValue ? 'selected' : '';
                options += `<option value="${timeStr}" ${isSelected}>${timeStr}</option>`;
            }
        }
        return options;
    }

    // Извличане на запазените данни от сървъра
    let existingHours = {};
    if (user.id) {
        try {
            const res = await fetch(`/api/business/working-hours/${user.id}`);
            const data = await res.json();
            if (data.success && data.workingHours) {
                existingHours = data.workingHours;
            }
        } catch (err) {
            console.error('Грешка при извличане на работното време:', err);
        }
    }

    // Генериране на редовете за дните
    container.innerHTML = '';
    days.forEach(day => {
        const dayData = existingHours[day.key] || { open: '09:00', close: '18:00', closed: false };

        const row = document.createElement('div');
        row.className = 'hours-row';
        row.innerHTML = `
            <span class="day-name">${day.label}</span>
            <select id="open-${day.key}" class="time-select" ${dayData.closed ? 'disabled' : ''}>
                ${generateTimeOptions(dayData.open)}
            </select>
            <select id="close-${day.key}" class="time-select" ${dayData.closed ? 'disabled' : ''}>
                ${generateTimeOptions(dayData.close)}
            </select>
            <label>
                <input type="checkbox" id="closed-${day.key}" ${dayData.closed ? 'checked' : ''}>
                Почивен
            </label>
        `;
        container.appendChild(row);

        const closedCheckbox = row.querySelector(`#closed-${day.key}`);
        const openSelect = row.querySelector(`#open-${day.key}`);
        const closeSelect = row.querySelector(`#close-${day.key}`);

        closedCheckbox.addEventListener('change', (e) => {
            const isClosed = e.target.checked;
            openSelect.disabled = isClosed;
            closeSelect.disabled = isClosed;
        });
    });

    // Бутон: Копирай Понеделник за Пон-Пет
    if (copyMonBtn) {
        copyMonBtn.addEventListener('click', () => {
            const monOpen = document.getElementById('open-mon').value;
            const monClose = document.getElementById('close-mon').value;
            const monClosed = document.getElementById('closed-mon').checked;

            ['tue', 'wed', 'thu', 'fri'].forEach(key => {
                const openSelect = document.getElementById(`open-${key}`);
                const closeSelect = document.getElementById(`close-${key}`);
                const closedCheckbox = document.getElementById(`closed-${key}`);

                openSelect.value = monOpen;
                closeSelect.value = monClose;
                closedCheckbox.checked = monClosed;

                openSelect.disabled = monClosed;
                closeSelect.disabled = monClosed;
            });
        });
    }

    // Запазване на формата
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const workingHours = {};
        days.forEach(day => {
            workingHours[day.key] = {
                open: document.getElementById(`open-${day.key}`).value,
                close: document.getElementById(`close-${day.key}`).value,
                closed: document.getElementById(`closed-${day.key}`).checked
            };
        });

        try {
            const res = await fetch('/api/business/working-hours', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: user.id,
                    workingHours
                })
            });

            const result = await res.json();
            statusMsg.style.display = 'block';

            if (res.ok && result.success) {
                statusMsg.className = 'status-msg success';
                statusMsg.innerText = result.message || 'Работното време е запазено успешно!';
            } else {
                statusMsg.className = 'status-msg error';
                statusMsg.innerText = result.message || 'Грешка при запазване.';
            }
        } catch (err) {
            statusMsg.style.display = 'block';
            statusMsg.className = 'status-msg error';
            statusMsg.innerText = 'Сървърна грешка при свързване.';
        }
    });
});