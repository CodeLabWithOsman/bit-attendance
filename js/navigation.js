// Navigation functionality

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navMenu.classList.toggle('active');
    });
  }
  
  // Theme toggle - Default to dark mode
  const themeToggle = document.getElementById('themeToggle');
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  
  // Force dark mode by default
  document.body.classList.add('dark-theme');
  if (sunIcon) sunIcon.classList.remove('hidden');
  if (moonIcon) moonIcon.classList.add('hidden');
  
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-theme');
      
      if (sunIcon && moonIcon) {
        sunIcon.classList.toggle('hidden');
        moonIcon.classList.toggle('hidden');
      }
    });
  }
  
  // Set active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
  
  // Check for admin path in URL
  const urlPath = window.location.pathname;
  if (urlPath.includes('/admin') || urlPath.includes('admin.html')) {
    // Redirect to prank page if trying to access admin directly
    if (!isAdminAuthenticated()) {
      window.location.href = 'prank.html';
    }
  }
});
