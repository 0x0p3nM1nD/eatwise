document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. ДЕКЛАРАЦИЯ НА ВСИЧКИ DOM ЕЛЕМЕНТИ
    // ==========================================
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('login-form');
    const formRegister = document.getElementById('register-form');
    const authTabs = document.querySelector('.auth-tabs');

    const step1 = document.getElementById('register-step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('register-step-3');
    const step4 = document.getElementById('register-step-4');

    const regEmail = document.getElementById('regEmail');
    const regPassword = document.getElementById('regPassword');
    const regTerms = document.getElementById('regTerms');
    const emailError = document.getElementById('emailError');
    const termsContainer = document.getElementById('termsContainer');

    const venueSearchInput = document.getElementById('venue-search');
    const venueSearchError = document.getElementById('venueSearchError');
    const regBusinessName = document.getElementById('reg-business-name');
    const venueManualError = document.getElementById('venueManualError');

    const regAddress = document.getElementById('reg-address');
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');

    const manualEntryLink = document.getElementById('manualEntryLink');
    const searchSection = document.getElementById('searchSection');
    const manualSection = document.getElementById('manualSection');

    const btnNext1 = document.getElementById('btn-next-step');
    const btnNext2 = document.getElementById('btn-next-step-2');
    const btnNext3 = document.getElementById('btn-next-step-3');

    const btnPrev1 = document.getElementById('back-to-step-1');
    const btnPrev2 = document.getElementById('btn-prev-step-2');
    const btnPrev3 = document.getElementById('btn-prev-step-3');

    let isManualMode = false;
    let selectedSearchAddress = '';

    // ==========================================
    // 2. ВАЛИДАЦИИ И ЧИСТЕНЕ НА ГРЕШКИ
    // ==========================================
    const allowedDomains = [
        'gmail.com', 'abv.bg', 'mail.bg', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'
    ];

    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) return false;
        const domain = email.split('@')[1]?.toLowerCase();
        return allowedDomains.includes(domain);
    }

    function isValidPhone(phone) {
        if (!phone) return false;
        const cleaned = phone.trim().replace(/\D/g, '');
        return /^0\d{7,9}$/.test(cleaned);
    }

    // Автоматично изчистване на грешките при писане
    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '').slice(0, 10);
            if (phoneError) phoneError.style.display = 'none';
            this.style.borderColor = '#cbd5e1';
        });
    }

    if (venueSearchInput) {
        venueSearchInput.addEventListener('input', function () {
            if (venueSearchError) venueSearchError.style.display = 'none';
            this.style.borderColor = '#cbd5e1';
        });
    }

    if (regBusinessName) {
        regBusinessName.addEventListener('input', function () {
            if (venueManualError) venueManualError.style.display = 'none';
            this.style.borderColor = '#cbd5e1';
        });
    }

    // ==========================================
    // 3. УПРАВЛЕНИЕ НА СТАКИТЕ (СТЪПКИТЕ)
    // ==========================================
    function showStep(stepNumber) {
        if (step1) step1.style.display = stepNumber === 1 ? 'block' : 'none';
        if (step2) step2.style.display = stepNumber === 2 ? 'block' : 'none';
        if (step3) step3.style.display = stepNumber === 3 ? 'block' : 'none';
        if (step4) step4.style.display = stepNumber === 4 ? 'block' : 'none';

        if (authTabs) {
            authTabs.style.display = stepNumber === 1 ? 'flex' : 'none';
        }

        if (stepNumber > 1) {
            if (tabRegister) tabRegister.classList.add('active');
            if (tabLogin) tabLogin.classList.remove('active');
            if (formRegister) {
                formRegister.classList.add('active');
                formRegister.style.display = 'block';
            }
            if (formLogin) {
                formLogin.classList.remove('active');
                formLogin.style.display = 'none';
            }
        }

        sessionStorage.setItem('eatwise_register_step', stepNumber);

        if (stepNumber === 4) {
            updateStep4Summary();
        }
    }

    // ==========================================
    // 4. СМЯНА НА ТАБОВЕТЕ И РЕЖИМИТЕ
    // ==========================================
    function switchToLogin() {
        if (tabLogin) tabLogin.classList.add('active');
        if (tabRegister) tabRegister.classList.remove('active');

        if (formLogin) {
            formLogin.classList.add('active');
            formLogin.style.display = 'block';
        }
        if (formRegister) {
            formRegister.classList.remove('active');
            formRegister.style.display = 'none';
        }

        sessionStorage.setItem('eatwise_register_step', 1);
        showStep(1);
    }

    function switchToRegister() {
        if (tabRegister) tabRegister.classList.add('active');
        if (tabLogin) tabLogin.classList.remove('active');

        if (formRegister) {
            formRegister.classList.add('active');
            formRegister.style.display = 'block';
        }
        if (formLogin) {
            formLogin.classList.remove('active');
            formLogin.style.display = 'none';
        }
    }

    if (tabLogin) tabLogin.addEventListener('click', switchToLogin);
    if (tabRegister) tabRegister.addEventListener('click', switchToRegister);

    document.querySelectorAll('.switch-to-login').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchToLogin();
        });
    });

    document.querySelectorAll('.switch-to-register').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchToRegister();
        });
    });

    // Превключване между Търсене и Ръчно въвеждане
    if (manualEntryLink) {
        manualEntryLink.addEventListener('click', () => {
            isManualMode = !isManualMode;

            if (venueSearchError) venueSearchError.style.display = 'none';
            if (venueManualError) venueManualError.style.display = 'none';
            if (venueSearchInput) venueSearchInput.style.borderColor = '#cbd5e1';
            if (regBusinessName) regBusinessName.style.borderColor = '#cbd5e1';

            if (isManualMode) {
                if (searchSection) searchSection.style.display = 'none';
                if (manualSection) manualSection.style.display = 'block';
                manualEntryLink.innerText = '← Обратно към търсенето на заведение';
                if (regBusinessName) regBusinessName.focus();

                initVenueMap();
                setTimeout(() => {
                    if (venueMap) venueMap.invalidateSize();
                }, 100);
            } else {
                if (searchSection) searchSection.style.display = 'block';
                if (manualSection) manualSection.style.display = 'none';
                manualEntryLink.innerText = 'Не намирате заведението си? Въведете го ръчно.';
            }
        });
    }

    const savedStep = parseInt(sessionStorage.getItem('eatwise_register_step')) || 1;
    showStep(savedStep);

    // ==========================================
    // 5. НАВИГАЦИЯ МЕЖДУ СТАКИТЕ (РЕГИСТРАЦИЯ)
    // ==========================================
    const emailExistsError = document.getElementById('emailExistsError');

    if (regEmail) {
        regEmail.addEventListener('input', function () {
            if (emailError) emailError.style.display = 'none';
            if (emailExistsError) emailExistsError.style.display = 'none';
            this.style.borderColor = '#cbd5e1';
        });
    }

    if (btnNext1) {
        btnNext1.addEventListener('click', async (e) => {
            e.preventDefault();

            const emailVal = regEmail ? regEmail.value.trim() : '';
            let hasError = false;

            if (emailError) emailError.style.display = 'none';
            if (emailExistsError) emailExistsError.style.display = 'none';

            if (!emailVal || !isValidEmail(emailVal)) {
                if (emailError) emailError.style.display = 'block';
                if (regEmail) regEmail.style.borderColor = '#ef4444';
                hasError = true;
            } else {
                if (regEmail) regEmail.style.borderColor = '#cbd5e1';
            }

            if (!regPassword || regPassword.value.trim() === '') {
                if (regPassword) regPassword.style.borderColor = '#ef4444';
                hasError = true;
            } else {
                if (regPassword) regPassword.style.borderColor = '#cbd5e1';
            }

            if (!regTerms || !regTerms.checked) {
                if (termsContainer) termsContainer.classList.add('error');
                hasError = true;
            } else {
                if (termsContainer) termsContainer.classList.remove('error');
            }

            if (hasError) return;

            btnNext1.disabled = true;
            btnNext1.innerText = 'Проверка...';

            try {
                const response = await fetch('/api/check-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailVal })
                });

                const data = await response.json();

                if (data.exists) {
                    if (emailExistsError) emailExistsError.style.display = 'block';
                    if (regEmail) regEmail.style.borderColor = '#ef4444';
                    return;
                }

                showStep(2);

            } catch (err) {
                console.error('Грешка при проверка на имейла:', err);
                showStep(2);
            } finally {
                btnNext1.disabled = false;
                btnNext1.innerText = 'Продължи';
            }
        });
    }

    if (btnPrev1) {
        btnPrev1.addEventListener('click', (e) => {
            e.preventDefault();
            showStep(1);
        });
    }

    if (btnNext2) {
        btnNext2.addEventListener('click', (e) => {
            e.preventDefault();

            const phoneVal = phoneInput ? phoneInput.value.trim() : '';
            let businessName = isManualMode ? regBusinessName?.value.trim() : venueSearchInput?.value.trim();

            let hasError = false;

            if (!businessName) {
                if (isManualMode) {
                    if (venueManualError) venueManualError.style.display = 'block';
                    if (regBusinessName) regBusinessName.style.borderColor = '#ef4444';
                } else {
                    if (venueSearchError) venueSearchError.style.display = 'block';
                    if (venueSearchInput) venueSearchInput.style.borderColor = '#ef4444';
                }
                hasError = true;
            } else {
                if (venueManualError) venueManualError.style.display = 'none';
                if (venueSearchError) venueSearchError.style.display = 'none';
                if (regBusinessName) regBusinessName.style.borderColor = '#cbd5e1';
                if (venueSearchInput) venueSearchInput.style.borderColor = '#cbd5e1';
            }

            if (!isValidPhone(phoneVal)) {
                if (phoneError) phoneError.style.display = 'block';
                if (phoneInput) phoneInput.style.borderColor = '#ef4444';
                hasError = true;
            } else {
                if (phoneError) phoneError.style.display = 'none';
                if (phoneInput) phoneInput.style.borderColor = '#cbd5e1';
            }

            if (!hasError) {
                showStep(3);
            }
        });
    }

    if (btnPrev2) {
        btnPrev2.addEventListener('click', (e) => {
            e.preventDefault();
            showStep(2);
        });
    }

    if (btnNext3) {
        btnNext3.addEventListener('click', (e) => {
            e.preventDefault();

            const selectedCategory = document.querySelector('input[name="businessType"]:checked');
            const categoryError = document.getElementById('categoryError');

            if (!selectedCategory) {
                if (categoryError) categoryError.style.display = 'block';
                return;
            }
            if (categoryError) categoryError.style.display = 'none';

            showStep(4);
        });
    }

    if (btnPrev3) {
        btnPrev3.addEventListener('click', (e) => {
            e.preventDefault();
            showStep(3);
        });
    }

    function updateStep4Summary() {
        const email = regEmail?.value.trim() || '-';
        let businessName = isManualMode ? regBusinessName?.value.trim() : venueSearchInput?.value.trim();
        const phone = phoneInput?.value.trim() || '-';

        let address = isManualMode
            ? (regAddress?.value.trim() || selectedSearchAddress)
            : (selectedSearchAddress || venueSearchInput?.value.trim());

        const selectedCategory = document.querySelector('input[name="businessType"]:checked');
        let categoryLabel = '-';
        if (selectedCategory) {
            const cardLabel = selectedCategory.closest('.category-card')?.querySelector('.label')?.innerText;
            categoryLabel = cardLabel || selectedCategory.value;
        }

        const sumEmail = document.getElementById('summary-email');
        const sumName = document.getElementById('summary-name');
        const sumPhone = document.getElementById('summary-phone');
        const sumAddress = document.getElementById('summary-address');
        const sumCategory = document.getElementById('summary-category');

        if (sumEmail) sumEmail.textContent = email;
        if (sumName) sumName.textContent = businessName || '-';
        if (sumPhone) sumPhone.textContent = phone;
        if (sumAddress) sumAddress.textContent = address || '-';
        if (sumCategory) sumCategory.textContent = categoryLabel;

        const mapIframe = document.getElementById('google-map-iframe');
        if (mapIframe) {
            const query = encodeURIComponent(`${businessName || ''} ${address || ''}`.trim());
            mapIframe.src = `https://maps.google.com/maps?q=${query}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
        }
    }

    // ==========================================
    // 6. LEAFLET КАРТА И AUTOCOMPLETE
    // ==========================================
    let venueMap = null;
    let venueMarker = null;

    function initVenueMap() {
        const mapElement = document.getElementById('venue-map');
        if (!mapElement || venueMap) return;

        const defaultCoords = [42.6977, 23.3219];
        venueMap = L.map('venue-map').setView(defaultCoords, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(venueMap);

        venueMarker = L.marker(defaultCoords, { draggable: true }).addTo(venueMap);

        venueMap.on('click', (e) => {
            setMapLocation(e.latlng.lat, e.latlng.lng);
        });

        venueMarker.on('dragend', () => {
            const pos = venueMarker.getLatLng();
            setMapLocation(pos.lat, pos.lng);
        });
    }

    function setMapLocation(lat, lng) {
        if (!venueMap || !venueMarker) return;

        venueMarker.setLatLng([lat, lng]);
        venueMap.panTo([lat, lng]);

        const apiKey = 'pk.40f2549e0bb6bb8ac679544751298e9f';
        const url = `https://us1.locationiq.com/v1/reverse?key=${apiKey}&lat=${lat}&lon=${lng}&format=json&zoom=18&namedetails=1&extratags=1&accept-language=bg`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data) {
                    const addr = data.address || {};
                    const namedetails = data.namedetails || {};
                    const extratags = data.extratags || {};

                    let venueName =
                        namedetails.name ||
                        extratags.name ||
                        addr.restaurant ||
                        addr.cafe ||
                        addr.bakery ||
                        addr.bar ||
                        addr.pub ||
                        addr.fast_food ||
                        addr.amenity ||
                        addr.shop ||
                        '';

                    if (!venueName && data.display_name) {
                        const firstPart = data.display_name.split(',')[0].trim();
                        if (isNaN(firstPart)) venueName = firstPart;
                    }

                    if (regBusinessName && venueName) {
                        regBusinessName.value = venueName;
                        if (venueManualError) venueManualError.style.display = 'none';
                        regBusinessName.style.borderColor = '#cbd5e1';
                    }
                    if (venueSearchInput) {
                        venueSearchInput.value = venueName || (data.display_name ? data.display_name.split(',')[0] : '');
                        if (venueSearchError) venueSearchError.style.display = 'none';
                        venueSearchInput.style.borderColor = '#cbd5e1';
                    }

                    if (data.display_name) {
                        selectedSearchAddress = data.display_name;
                        if (regAddress) regAddress.value = data.display_name;
                    }
                }
            })
            .catch(err => console.error('Грешка при извличане от картата:', err));
    }

    if (venueSearchInput) {
        let locationResults = document.getElementById('location-results');
        if (!locationResults) {
            locationResults = document.createElement('div');
            locationResults.id = 'location-results';
            locationResults.className = 'search-results-list';
            venueSearchInput.parentElement.appendChild(locationResults);
        }

        let typingTimer;
        venueSearchInput.addEventListener('input', function () {
            clearTimeout(typingTimer);
            const query = this.value.trim();

            if (query.length < 3) {
                locationResults.style.display = 'none';
                return;
            }

            typingTimer = setTimeout(() => {
                const apiKey = 'pk.40f2549e0bb6bb8ac679544751298e9f';
                const url = `https://api.locationiq.com/v1/autocomplete?key=${apiKey}&q=${encodeURIComponent(query)}&countrycodes=bg&limit=5&accept-language=bg`;

                fetch(url)
                    .then(res => res.json())
                    .then(data => {
                        locationResults.innerHTML = '';
                        if (data && data.length > 0) {
                            data.forEach(place => {
                                const div = document.createElement('div');
                                div.className = 'auth-autocomplete-item';
                                div.style.cssText = 'padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #e2e8f0; font-size: 13px;';
                                div.textContent = place.display_name;

                                div.addEventListener('click', () => {
                                    const shortName = place.display_name.split(',')[0];
                                    venueSearchInput.value = shortName;
                                    if (venueSearchError) venueSearchError.style.display = 'none';
                                    venueSearchInput.style.borderColor = '#cbd5e1';

                                    selectedSearchAddress = place.display_name;
                                    if (regAddress) regAddress.value = place.display_name;

                                    locationResults.style.display = 'none';

                                    if (place.lat && place.lon) {
                                        setMapLocation(parseFloat(place.lat), parseFloat(place.lon));
                                    }
                                });

                                locationResults.appendChild(div);
                            });
                            locationResults.style.display = 'block';
                        } else {
                            locationResults.style.display = 'none';
                        }
                    })
                    .catch(() => { locationResults.style.display = 'none'; });
            }, 300);
        });

        document.addEventListener('click', (e) => {
            if (e.target !== venueSearchInput && !locationResults.contains(e.target)) {
                locationResults.style.display = 'none';
            }
        });
    }

    // ==========================================
    // 7. ИЗПРАЩАНЕ НА ФОРМАТА ЗА РЕГИСТРАЦИЯ
    // ==========================================
    if (formRegister) {
        formRegister.addEventListener('submit', async (e) => {
            e.preventDefault();

            const errorBox = document.getElementById('register-error-box');
            const errorText = document.getElementById('register-error-text');
            if (errorBox) errorBox.style.display = 'none';

            const email = regEmail?.value.trim() || '';
            const password = regPassword?.value || '';
            const phone = phoneInput?.value.trim() || '';

            let businessName = isManualMode ? regBusinessName?.value.trim() : venueSearchInput?.value.trim();

            let address = isManualMode
                ? (regAddress?.value.trim() || selectedSearchAddress)
                : (selectedSearchAddress || venueSearchInput?.value.trim() || '');

            const selectedCategory = document.querySelector('input[name="businessType"]:checked');
            const categoryLabel = selectedCategory
                ? (selectedCategory.closest('.category-card')?.querySelector('.label')?.innerText || selectedCategory.value)
                : '';

            if (!isValidPhone(phone)) {
                if (phoneError) phoneError.style.display = 'block';
                if (phoneInput) phoneInput.style.borderColor = '#ef4444';
                return;
            }

            const finishBtn = document.getElementById('btn-finish-register');
            if (finishBtn) {
                finishBtn.disabled = true;
                finishBtn.innerText = 'Обработка...';
            }

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        password,
                        businessName,
                        phone,
                        address,
                        category: categoryLabel
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    sessionStorage.removeItem('eatwise_register_step');
                    localStorage.setItem('user', JSON.stringify(result.user));
                    window.location.href = '/dashboard';
                } else {
                    if (errorBox && errorText) {
                        errorText.innerText = result.message || 'Този бизнес вече е регистриран в системата.';
                        errorBox.style.display = 'flex';
                        errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            } catch (error) {
                console.error('Грешка при регистрация:', error);
                if (errorBox && errorText) {
                    errorText.innerText = 'Сървърна грешка при изпращане на данните.';
                    errorBox.style.display = 'flex';
                }
            } finally {
                if (finishBtn) {
                    finishBtn.disabled = false;
                    finishBtn.innerText = 'Потвърди и завърши';
                }
            }
        });
    }

    // ==========================================
    // 8. ИЗПРАЩАНЕ НА ФОРМАТА ЗА ВХОД (LOGIN)
    // ==========================================
    if (formLogin) {
        const loginEmail = document.getElementById('login-email');
        const loginPassword = document.getElementById('login-password');
        const errorBox = document.getElementById('login-error');

        // Скриване на червената грешка при въвеждане на нови данни
        [loginEmail, loginPassword].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    if (errorBox) errorBox.style.display = 'none';
                });
            }
        });

        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = loginEmail ? loginEmail.value.trim() : '';
            const password = loginPassword ? loginPassword.value : '';

            if (errorBox) errorBox.style.display = 'none';

            if (!email || !password) {
                if (errorBox) {
                    errorBox.innerText = 'Моля, попълнете имейл и парола.';
                    errorBox.style.display = 'block';
                }
                return;
            }

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    localStorage.setItem('user', JSON.stringify(result.user));
                    window.location.href = '/dashboard';
                } else {
                    // Покажи точната грешка от сървъра (отхвърлен / чакащ / грешна парола) в червения банер
                    if (errorBox) {
                        errorBox.innerText = result.message || 'Грешен имейл или парола.';
                        errorBox.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error('Грешка при вход:', error);
                if (errorBox) {
                    errorBox.innerText = 'Сървърна грешка при опит за вход. Опитайте отново.';
                    errorBox.style.display = 'block';
                }
            }
        });
    }

    // ==========================================
    // 9. ДОПОЛНИТЕЛНИ ЕФЕКТИ И TOGGLE PASSWORD
    // ==========================================
    const togglePasswordBtn = document.getElementById('togglePassword');
    if (togglePasswordBtn && regPassword) {
        togglePasswordBtn.addEventListener('click', function () {
            const type = regPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            regPassword.setAttribute('type', type);
            this.classList.toggle('active');
        });
    }

    const parallaxContainer = document.getElementById('parallax-container');
    if (parallaxContainer) {
        parallaxContainer.addEventListener('mousemove', (e) => {
            const rect = parallaxContainer.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - rect.width / 2;
            const mouseY = e.clientY - rect.top - rect.height / 2;

            const layers = parallaxContainer.querySelectorAll('.parallax-layer');
            layers.forEach(layer => {
                const speed = parseFloat(layer.getAttribute('data-speed')) || 1;
                const x = (mouseX * speed) / 60;
                const y = (mouseY * speed) / 60;
                layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            });
        });

        parallaxContainer.addEventListener('mouseleave', () => {
            const layers = parallaxContainer.querySelectorAll('.parallax-layer');
            layers.forEach(layer => {
                layer.style.transition = 'transform 0.5s ease-out';
                layer.style.transform = 'translate3d(0, 0, 0)';
            });
        });

        parallaxContainer.addEventListener('mouseenter', () => {
            const layers = parallaxContainer.querySelectorAll('.parallax-layer');
            layers.forEach(layer => {
                layer.style.transition = 'none';
            });
        });
    }
});