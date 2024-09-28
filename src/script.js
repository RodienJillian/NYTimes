const API_ENDPOINTS = {
    world: 'https://api.nytimes.com/svc/topstories/v2/world.json?api-key=PGGtJJ3sCyukXK7sKhkY9VNWr7989VSb',
    arts: 'https://api.nytimes.com/svc/topstories/v2/arts.json?api-key=PGGtJJ3sCyukXK7sKhkY9VNWr7989VSb',
    science: 'https://api.nytimes.com/svc/topstories/v2/science.json?api-key=PGGtJJ3sCyukXK7sKhkY9VNWr7989VSb',
    us: 'https://api.nytimes.com/svc/topstories/v2/us.json?api-key=PGGtJJ3sCyukXK7sKhkY9VNWr7989VSb'
};

var setVanta = () => {
    if (window.VANTA) {
        window.VANTA.GLOBE({
            el: "#vanta-background", 
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 0.75,
            scaleMobile: 1.00,
            color: 0x1b1b55,
            color2: 0x0,
            size: 2.00,
            backgroundColor: 0xe8e8e8
        });
    }
}

window.addEventListener('load', setVanta);

window.addEventListener('scroll', function() {
    const scrollToTopButton = document.querySelector('.scroll-to-top');
    if (window.scrollY > 300) {
        scrollToTopButton.style.display = 'block';
    } else {
        scrollToTopButton.style.display = 'none';
    }
});

document.querySelector('.scroll-to-top').addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' 
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const dayOfWeekDiv = document.getElementById('day-of-week');
    const currentDateDiv = document.getElementById('current-date');

    const today = new Date();
    const optionsDay = { weekday: 'long' };
    const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };

    const dayOfWeek = today.toLocaleDateString('en-US', optionsDay);
    const currentDate = today.toLocaleDateString('en-US', optionsDate);

    dayOfWeekDiv.textContent = `${dayOfWeek},`;
    currentDateDiv.textContent = currentDate;

    const menuIcon = document.querySelector('.menu-icon');
    const menu = document.getElementById('menu');
    
    menuIcon.addEventListener('click', function () {
        menu.classList.toggle('show-menu');
    });
   
    fetchAllArticles(); 

    const menuItems = menu.querySelectorAll('a');
    menuItems.forEach(item => {
        item.addEventListener('click', function (event) {
            event.preventDefault(); 
            const fileName = this.getAttribute('data-file'); 
            const category = this.textContent.trim(); 

            if (fileName === 'home') {
                fetchAllArticles(); 
            } else {
                fetchFilteredArticles(fileName, category); 
            }
        });
    });
});

function fetchAllArticles() {
    Promise.all([
        fetch(API_ENDPOINTS.world),
        fetch(API_ENDPOINTS.arts),
        fetch(API_ENDPOINTS.science),
        fetch(API_ENDPOINTS.us)
    ])
    .then(responses => {
        return Promise.all(responses.map(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok for ${response.url}`);
            }
            return response.json();
        }));
    })
    .then(dataArrays => {
        const allArticles = dataArrays.flatMap(data => data.results || []);
        displayArticles(allArticles, 'All');
        
        window.scrollTo({
            top: 0,
            behavior: 'smooth' 
        });
    })
    .catch(error => console.log('Error fetching all articles:', error));
}


function fetchFilteredArticles(fileName, category) {
    let apiEndpoint = API_ENDPOINTS[fileName]; 
    fetch(apiEndpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok for ${fileName}`);
            }
            return response.json();
        })
        .then(data => {
            displayArticles(data.results || [], category);
            
            window.scrollTo({
                top: 0,
                behavior: 'smooth' 
            });
        })
        .catch(error => {
            console.log(`Error fetching data from ${fileName}:`, error);
        });
}


function displayArticles(articles, category) {
    const articleContainer = document.getElementById('article-container');
    const sectionTitle = document.getElementById('section-title');

    articleContainer.innerHTML = '';

    if (category === 'All') {
        sectionTitle.textContent = 'All News';
    } else {
        sectionTitle.textContent = `${category} News`;
    }

    articles.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('article');

        let articleImage = '';
        if (article.multimedia && article.multimedia.length > 0) {
            const imageUrl = article.multimedia[0].url;
            articleImage = `<img src="${imageUrl}" alt="${article.title}" class="article-image" />`;
        }

        articleDiv.innerHTML = `
            <a href="${article.url}" target="_blank" class="article-link">
                ${articleImage}
                <h2>${article.title}</h2>
                <p>${article.abstract}</p>
            </a>
        `;
        
        articleContainer.appendChild(articleDiv);
    });
}
