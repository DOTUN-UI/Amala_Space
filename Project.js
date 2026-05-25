// Navbar scroll effect
const nav = document.querySelector("nav");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Hamburger menu
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector("nav ul");
hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("open");
  hamburger.classList.toggle("active");
});
navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    hamburger.classList.remove("active");
  });
});

// Form validation
const form = document.querySelector(".contact-form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const emailInput = form.querySelector('input[type="email"]');
  const messageInput = form.querySelector("textarea");
  const email = emailInput.value.trim();
  const message = messageInput.value.trim();

  form.querySelectorAll(".form-msg").forEach((el) => el.remove());

  const showMsg = (text, type) => {
    const msg = document.createElement("p");
    msg.className = `form-msg ${type}`;
    msg.textContent = text;
    form.appendChild(msg);
    setTimeout(() => msg.remove(), 4000);
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    showMsg("Please enter your email address.", "error");
    emailInput.focus();
    return;
  }
  if (!emailRegex.test(email)) {
    showMsg("Please enter a valid email address.", "error");
    emailInput.focus();
    return;
  }
  if (!message) {
    showMsg("Please enter a message.", "error");
    messageInput.focus();
    return;
  }

  showMsg("Message sent! We'll get back to you soon.", "success");
  form.reset();
});

// Back to top button
const backToTop = document.createElement("button");
backToTop.innerText = "↑";
backToTop.id = "backToTop";
document.body.appendChild(backToTop);

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Dark mode toggle
const darkModeBtn = document.createElement("button");
darkModeBtn.innerText = "🌙";
darkModeBtn.id = "darkModeToggle";
document.querySelector("nav").appendChild(darkModeBtn);

darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    darkModeBtn.innerText = "☀️";
  } else {
    darkModeBtn.innerText = "🌙";
  }
});

// Fetch and display posts from Supabase
async function getPosts() {
  const { data, error } = await supabaseClient
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error(error);
    return;
  }

  const container = document.querySelector(".blog-container");

  container.innerHTML = data
    .map(
      (post) => `
  <div class="blog-card">
    <img src="${post.image_url}" alt="${post.title}" />
    <div class="blog-content">
      <h3>${post.title}</h3>
      <p>${post.content.split(" ").slice(0, 10).join(" ")}...</p>
      <a href="post.html?id=${post.id}"><button>Read More</button></a>
    </div>
  </div>
`,
    )
    .join("");

  // Observe new cards after they're rendered
  const cards = document.querySelectorAll(".blog-card");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  cards.forEach((card) => observer.observe(card));
}

getPosts();
