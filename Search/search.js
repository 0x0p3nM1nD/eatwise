// Чакаме целият HTML да се зареди, преди да пуснем скрипта
document.addEventListener('DOMContentLoaded', function() {
    
    // Всички променливи са затворени тук и няма да се "сбият" с нищо друго
    const cityInputField = document.getElementById('cityInput');
    const resultsContainer = document.getElementById('results');
    const searchForm = document.getElementById('cityForm');

    // Проверяваме дали елементите съществуват, за да избегнем други грешки
    if (!cityInputField || !resultsContainer || !searchForm) return;

    cityInputField.addEventListener('input', function() {
        const val = this.value.trim().toLowerCase();
        resultsContainer.innerHTML = ''; 
        
        if (!val) return; 

        // bulgarianCities идва от cities.js
        const filteredCities = bulgarianCities.filter(city => 
            city.toLowerCase().includes(val)
        );

        filteredCities.forEach(city => {
            const div = document.createElement('div');
            div.className = 'result-item';
            
            const regex = new RegExp(`(${val})`, "gi");
            div.innerHTML = city.replace(regex, "<strong>$1</strong>");

            div.addEventListener('click', function() {
                cityInputField.value = city; 
                resultsContainer.innerHTML = ''; 
                submitSearch(city); 
            });
            resultsContainer.appendChild(div);
        });
    });

    document.addEventListener('click', function(e) {
        if (!searchForm.contains(e.target)) {
            resultsContainer.innerHTML = '';
        }
    });

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        const city = cityInputField.value.trim();
        if (city) {
            submitSearch(city);
        }
    });

    function submitSearch(city) {
        const encodedCity = encodeURIComponent(city);
        window.location.href = `city_search.html?city=${encodedCity}`;
    }
});