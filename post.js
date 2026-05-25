async function getSinglePost() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    document.getElementById("post-container").innerHTML =
      "<p>Post not found</p>";
    return;
  }
  const { data, error } = await supabaseClient
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error(error);
    return;
  }
  const container = document.getElementById("post-container");
  container.innerHTML = `
    <img src="${data.image_url}" alt="${data.title}" />
    <h1>${data.title}</h1>
    <p class="post-meta">${data.author} · ${data.genre} · ${new Date(data.created_at).toLocaleDateString()}</p>
    <p class="post-content">${data.content}</p>
  `;
}
getSinglePost();
