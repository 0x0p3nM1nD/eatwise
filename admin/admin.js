document.addEventListener('DOMContentLoaded', () => {

    const loginOverlay = document.getElementById('admin-login-overlay');
    const mainContent = document.getElementById('admin-main-content');
    const loginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('admin-login-error');
    const loginBtn = document.getElementById('admin-login-btn');
    const logoutBtn = document.getElementById('admin-logout-btn');

    // 🔴 ВИНАГИ изчистваме сесията при всяко влизане/презареждане
    sessionStorage.removeItem('eatwise_admin_token');

    // 🔴 ВИНАГИ показваме входния панел и крием таблото
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'none';

    // 2. Логин форма
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('admin-username')?.value.trim();
            const password = document.getElementById('admin-password')?.value;

            if (loginError) loginError.style.display = 'none';
            if (loginBtn) {
                loginBtn.disabled = true;
                loginBtn.innerText = 'Проверка...';
            }

            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    sessionStorage.setItem('eatwise_admin_token', data.adminToken || 'true');

                    // Показваме съдържанието само след успешен вход
                    if (loginOverlay) loginOverlay.style.display = 'none';
                    if (mainContent) mainContent.style.display = 'block';

                    loadBusinessesTable();
                } else {
                    if (loginError) {
                        loginError.innerText = data.message || 'Грешно потребителско име или парола.';
                        loginError.style.display = 'block';
                    }
                }
            } catch (err) {
                console.error('Грешка при админ вход:', err);
                if (loginError) {
                    loginError.innerText = 'Сървърна грешка при опит за вход.';
                    loginError.style.display = 'block';
                }
            } finally {
                if (loginBtn) {
                    loginBtn.disabled = false;
                    loginBtn.innerText = 'Вход в системата';
                }
            }
        });
    }

    // 3. Бутон за ИЗХОД (Logout)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('eatwise_admin_token');
            window.location.reload();
        });
    }
});

// 4. Функция за зареждане на таблицата с бизнесите и бутоните Одобри/Отхвърли
async function loadBusinessesTable() {
    const tbody = document.getElementById('businesses-tbody');
    if (!tbody) return;

    try {
        const response = await fetch('/api/admin/businesses');
        const data = await response.json();

        if (data.success && data.businesses) {
            tbody.innerHTML = '';

            if (data.businesses.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#94a3b8; padding:20px;">Няма намерени бизнеси.</td></tr>';
                return;
            }

            data.businesses.forEach(b => {
                const tr = document.createElement('tr');

                // Статус значка
                let statusBadge = '';
                if (b.status === 'pending' || !b.status) {
                    statusBadge = '<span style="background: #f59e0b; color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold;">Чака преглед</span>';
                } else if (b.status === 'approved') {
                    statusBadge = '<span style="background: #10b981; color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold;">Одобрен</span>';
                } else {
                    statusBadge = '<span style="background: #ef4444; color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold;">Отхвърлен</span>';
                }

                // Бутони за действия
                let actionButtons = '';
                if (b.status === 'pending' || !b.status) {
                    actionButtons = `
                        <button onclick="changeBusinessStatus(${b.id}, 'approved')" style="background: #10b981; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold; margin-right: 4px;">✅ Одобри</button>
                        <button onclick="changeBusinessStatus(${b.id}, 'rejected')" style="background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">❌ Отхвърли</button>
                    `;
                } else if (b.status === 'approved') {
                    actionButtons = `<button onclick="changeBusinessStatus(${b.id}, 'rejected')" style="background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px;">Блокирай</button>`;
                } else {
                    actionButtons = `<button onclick="changeBusinessStatus(${b.id}, 'approved')" style="background: #10b981; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 12px;">Активирай отново</button>`;
                }

                const createdDate = b.created_at ? new Date(b.created_at).toLocaleDateString('bg-BG') : '-';

                tr.innerHTML = `
                    <td>#${b.id}</td>
                    <td><strong>${escapeHtml(b.business_name || '')}</strong></td>
                    <td>${escapeHtml(b.category || '-')}</td>
                    <td>${escapeHtml(b.address || '-')}</td>
                    <td>
                        <div>📞 <a href="tel:${b.phone}" style="color: #60a5fa; font-weight: bold;">${escapeHtml(b.phone || '')}</a></div>
                        <div style="font-size: 11px; color: #94a3b8;">✉️ ${escapeHtml(b.email || '')}</div>
                    </td>
                    <td>${statusBadge}</td>
                    <td>${createdDate}</td>
                    <td>${actionButtons}</td>
                `;

                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error('Грешка при зареждане на бизнеси:', err);
    }
}

// 5. Функция за смяна на статуса (Одобри/Отхвърли)
async function changeBusinessStatus(businessId, newStatus) {
    const actionText = newStatus === 'approved' ? 'одобрите' : 'отхвърлите';
    if (!confirm(`Сигурни ли сте, че искате да ${actionText} този бизнес?`)) return;

    try {
        const response = await fetch(`/api/admin/business/${businessId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json();
        if (data.success) {
            loadBusinessesTable(); // Опреснява таблицата веднага
        } else {
            alert(data.message || 'Грешка при промяна на статуса.');
        }
    } catch (err) {
        console.error('Грешка при промяна на статус:', err);
        alert('Сървърна грешка.');
    }
}

function escapeHtml(str) {
    return (str || '').replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}