// Navbar scroll effect
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Blog card fade-in
const cards = document.querySelectorAll('.blog-card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
cards.forEach(card => observer.observe(card));

// Hamburger menu
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('nav ul');
hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  hamburger.classList.toggle('active');
});
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

// Form validation
const form = document.querySelector('.contact-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const emailInput = form.querySelector('input[type="email"]');
  const messageInput = form.querySelector('textarea');
  const email = emailInput.value.trim();
  const message = messageInput.value.trim();

  form.querySelectorAll('.form-msg').forEach(el => el.remove());

  const showMsg = (text, type) => {
    const msg = document.createElement('p');
    msg.className = `form-msg ${type}`;
    msg.textContent = text;
    form.appendChild(msg);
    setTimeout(() => msg.remove(), 4000);
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) { showMsg('Please enter your email address.', 'error'); emailInput.focus(); return; }
  if (!emailRegex.test(email)) { showMsg('Please enter a valid email address.', 'error'); emailInput.focus(); return; }
  if (!message) { showMsg('Please enter a message.', 'error'); messageInput.focus(); return; }

  showMsg("Message sent! We'll get back to you soon.", 'success');
  form.reset();
});