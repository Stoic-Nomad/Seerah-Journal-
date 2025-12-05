// --- NAVIGATION LOGIC ---
function openSection(sectionId) {
    document.querySelector('.main-header').style.display = 'none';
    document.getElementById('nav-panel').style.display = 'none';

    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => sec.classList.add('hidden'));
    
    const target = document.getElementById(sectionId);
    target.classList.remove('hidden');
    
    // Trigger specific section logic
    if(sectionId === 'section-maps') initCarousel();
    if(sectionId === 'section-attributes') fetchAttributes();
}

function closeSection() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => sec.classList.add('hidden'));

    document.querySelector('.main-header').style.display = 'block';
    document.getElementById('nav-panel').style.display = 'block';
}

// --- JSON FETCH LOGIC (Attributes) ---
async function fetchAttributes() {
    const attrContainer = document.getElementById('attributes-accordion');
    const skillContainer = document.getElementById('skills-list');
    
    // Prevent double loading
    if(attrContainer.children.length > 1) return;

    attrContainer.innerHTML = '<div class="loading">Loading data...</div>';

    try {
        // Adding ?t=timestamp forces the browser to get a fresh copy, ignoring cache
        const response = await fetch('./data.json?t=' + new Date().getTime());
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        // 1. Render Attributes (Accordion)
        attrContainer.innerHTML = '';
        data.attributes.forEach((attr, index) => {
            const isActive = index === 0 ? 'active' : '';
            const statusText = index === 0 ? '▼ Click to collapse' : '▶ Click to expand';

            const item = document.createElement('div');
            item.className = `accordion-item ${isActive}`;
            item.onclick = function() { toggleAccordion(this) };

            item.innerHTML = `
                <div class="accordion-header">
                    <h4>${attr.name}</h4>
                    <span class="accordion-status">${statusText}</span>
                </div>
                <div class="accordion-body">
                    <p>${attr.description}</p>
                </div>
            `;
            attrContainer.appendChild(item);
        });

        // 2. Render Skills (List)
        skillContainer.innerHTML = '';
        data.skills.forEach(skill => {
            const row = document.createElement('div');
            row.className = 'skill-item-row';
            row.textContent = skill;
            skillContainer.appendChild(row);
        });

    } catch (error) {
        console.error('Fetch failed:', error);
        attrContainer.innerHTML = `
            <div style="color:red; padding:20px; border:1px solid red; background:#fff0f0;">
                <strong>Error Loading Data:</strong><br>
                ${error.message}<br><br>
                <em>Ensure data.json is in the same folder and you are using Live Server.</em>
            </div>`;
    }
}

// --- ACCORDION LOGIC ---
function toggleAccordion(element) {
    const allItems = document.querySelectorAll('.accordion-item');
    allItems.forEach(item => {
        if(item !== element) {
            item.classList.remove('active');
            item.querySelector('.accordion-status').innerText = '▶ Click to expand';
        }
    });

    element.classList.toggle('active');
    const statusSpan = element.querySelector('.accordion-status');
    statusSpan.innerText = element.classList.contains('active') ? '▼ Click to collapse' : '▶ Click to expand';
}

// --- TREE LOGIC ---
function toggleNode(element) {
    const nestedList = element.nextElementSibling;
    if (nestedList && nestedList.tagName === 'UL') {
        nestedList.classList.toggle('active');
        element.classList.toggle('open');
    }
}

// --- CAROUSEL LOGIC ---
let track, slides, slideWidth;

function initCarousel() {
    track = document.querySelector('.carousel-track');
    if(!track) return;
    
    slides = Array.from(track.children);
    if(slides.length > 0) {
        slideWidth = slides[0].getBoundingClientRect().width;
        slides.forEach((slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        });
    }
}

function moveSlide(direction) {
    const currentSlide = track.querySelector('.current-slide');
    const currentDot = document.querySelector('.current-indicator');
    
    const currentIndex = slides.findIndex(slide => slide === currentSlide);
    let targetIndex;

    if (direction === 1) {
        if (currentIndex === slides.length - 1) return;
        targetIndex = currentIndex + 1;
    } else {
        if (currentIndex === 0) return;
        targetIndex = currentIndex - 1;
    }

    const nextSlide = slides[targetIndex];
    const dots = document.querySelectorAll('.carousel-indicator');
    const nextDot = dots[targetIndex];

    track.style.transform = 'translateX(-' + (slideWidth * targetIndex) + 'px)';
    
    currentSlide.classList.remove('current-slide');
    nextSlide.classList.add('current-slide');

    currentDot.classList.remove('current-indicator');
    nextDot.classList.add('current-indicator');
}