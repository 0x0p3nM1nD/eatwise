// Файл: Popup/modal.js

document.addEventListener('DOMContentLoaded', function() {
    const openBtn = document.getElementById('openDownloadModal');
    const closeBtn = document.getElementById('closeDownloadModal');
    const modal = document.getElementById('downloadModal');

    if (openBtn && closeBtn && modal) {
        // Отваряне
        openBtn.addEventListener('click', function(e) {
            e.preventDefault(); 
            modal.classList.add('active');
        });

        // Затваряне от бутона Х
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
        });

        // Затваряне при клик извън белия прозорец
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
});