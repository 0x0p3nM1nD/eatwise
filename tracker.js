(function () {
    // Вземаме точния път (напр. "/index.html" или "/offers.html")
    let currentPage = window.location.pathname;
    
    if (currentPage === '/' || currentPage === '') {
        currentPage = '/index.html';
    }

    fetch('http://localhost:5000/api/track-visit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page: currentPage })
    }).catch(err => console.warn('Тракерът е офлайн'));
})();