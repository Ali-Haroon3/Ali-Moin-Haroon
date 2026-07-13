// Wait for document to be ready
$(document).ready(function() {
    // Header scrolling effect
    $(window).on('scroll', function(){
        if($(window).scrollTop()){
            $('header').addClass('nav-show');
        }
        else{
            $('header').removeClass('nav-show');
        }
    });
});

// Hamburger navigation
const navSlide = () => {
    const hamburger = document.querySelector(".hamburger");
    const navbar = document.querySelector(".nav-bar");
    const navLinks = document.querySelectorAll(".nav-bar li");
    
    if (hamburger) {
        hamburger.onclick = () => {
            navbar.classList.toggle("nav-active");
            
            // Animation links
            navLinks.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = "";
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 1}s`;
                }
            });
            
            // Hamburger animation
            hamburger.classList.toggle("toggle");
        }
    }
}

// Initialize when page loads
window.onload = () => navSlide();