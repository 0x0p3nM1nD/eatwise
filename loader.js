(function () {
    // 1. Автоматично инжектиране на CSS стиловете
    const style = document.createElement('style');
    style.textContent = `
        #loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 999999;
            opacity: 1;
            visibility: visible;
            transition: opacity 0.4s ease, visibility 0.4s ease;
        }

        #loading-screen.hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }

        .loader-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #dcfce7;
            border-top: 5px solid #16a34a;
            border-radius: 50%;
            animation: eatwise-spin 0.8s linear infinite;
        }

        .loader-brand {
            margin-top: 16px;
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
            font-family: system-ui, -apple-system, sans-serif;
            letter-spacing: -0.5px;
        }

        .loader-brand span {
            color: #16a34a;
        }

        @keyframes eatwise-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // 2. Създаване на елемента за зареждане в HTML
    function createLoader() {
        if (document.getElementById('loading-screen')) return;

        const loader = document.createElement('div');
        loader.id = 'loading-screen';
        loader.innerHTML = `
            <div class="loader-spinner"></div>
            <div class="loader-brand">Eat<span>Wise</span></div>
        `;

        if (document.body) {
            document.body.prepend(loader);
        } else {
            document.addEventListener('DOMContentLoaded', () => document.body.prepend(loader));
        }
    }

    createLoader();

    // 3. Скриване при зареждане/връщане на страницата с 1 секунда (1000ms) delay
    function hideLoader() {
        const loader = document.getElementById('loading-screen');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 500); // 1 секунда забавяне след зареждане
        }
    }

    window.addEventListener('load', hideLoader);

    // Поддръжка за бутона "Назад / Напред" (Back/Forward Cache)
    window.addEventListener('pageshow', () => {
        hideLoader();
    });

    // 4. Показване при клик върху линк с 1 секунда delay преди преминаване
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (
            href && 
            !href.startsWith('#') && 
            !href.startsWith('javascript:') && 
            !href.startsWith('mailto:') &&
            !href.startsWith('tel:') &&
            link.target !== '_blank'
        ) {
            e.preventDefault(); // Спираме незабавното отваряне

            const loader = document.getElementById('loading-screen');
            if (loader) {
                loader.classList.remove('hidden'); // Показваме анимацията
            }

            // Изчакваме точно 1 секунда и тогава пренасочваме към новия адрес
            setTimeout(() => {
                window.location.href = href;
            }, 1000);
        }
    });
})();