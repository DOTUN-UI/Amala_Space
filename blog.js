async function getPosts(genre = "all") {
  const container = document.getElementById("blogs-container");
  container.innerHTML = '<p id="loading">Loading posts...</p>';
  
  let query = supabaseClient
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (genre !== "all") {
    query = query.eq("genre", genre);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error(error);
    container.innerHTML = "<p>Failed to load posts</p>";
    return;
  }
  
  if (data.length === 0) {
    container.innerHTML = "<p>No posts found</p>";
    return;
  }
  
  container.innerHTML = data
    .map(
      (post) => `
    <div class="blog-card">
      <img src="${post.image_url}" alt="${post.title}" />
      <div class="blog-content">
        <span class="blog-tag ${post.genre}">${post.genre}</span>
        <h3>${post.title}</h3>
        <p>${post.content.split(" ").slice(0, 10).join(" ")}...</p>
        <a href="post.html?id=${post.id}"><button>Read More</button></a>
      </div>
    </div>
  `,
    )
    .join("");

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

// Filter buttons
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    getPosts(btn.dataset.category);
  });
});

getPosts();
