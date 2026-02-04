document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navItems = document.querySelectorAll('.nav-item');
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if(this.getAttribute('href') === '#') {
                e.preventDefault();
            }
            if (window.innerWidth <= 768) {
               // hamburger.classList.remove('active');
               // navList.classList.remove('active');
            }
            navItems.forEach(item => item.classList.remove('active'));
            this.parentElement.classList.add('active');
        });
    });

    if(hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navList.classList.toggle('active');
        });
    }
});