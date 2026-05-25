const ADMIN_PASSWORD = "AmalaAdmin123";

const passwordGate = document.getElementById("password-gate");
const adminPanel = document.getElementById("admin-panel");
const loginBtn = document.getElementById("login-btn");
const passwordInput = document.getElementById("password-input");
const loginError = document.getElementById("login-error");
const postsTableBody = document.getElementById("posts-table-body");

// Check session cookie
function checkSession() {
  const loggedIn = document.cookie
    .split("; ")
    .find((row) => row.startsWith("admin="));

  if (loggedIn) {
    passwordGate.style.display = "none";
    adminPanel.style.display = "flex";
    getPosts();
  } else {
    passwordGate.style.display = "flex";
    adminPanel.style.display = "none";
  }
}

// LOGIN FUNCTIONALITY - WHEN THE LOGIN BUTTON IS CLICKED, IT CHECKS THE ENTERED PASSWORD AGAINST THE PREDEFINED ADMIN_PASSWORD. IF THE PASSWORD IS CORRECT, IT SETS A COOKIE TO KEEP THE ADMIN LOGGED IN FOR 1 DAY AND SHOWS THE ADMIN PANEL. IF THE PASSWORD IS INCORRECT, IT DISPLAYS AN ERROR MESSAGE.
loginBtn.addEventListener("click", () => {
  const entered = passwordInput.value.trim();

  if (entered === ADMIN_PASSWORD) {
    document.cookie = "admin=true; max-age=86400; path=/";
    checkSession();
  } else {
    loginError.textContent = "Incorrect password";
  }
});

// FETCH ALL POSTS FROM SUPABASE AND DISPLAY IN TABLE
async function getPosts() {
  const { data, error } = await supabaseClient
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  postsTableBody.innerHTML = data
    .map(
      (post) => `
    <tr>
     <td data-label="Image"><img src="${post.image_url}" alt="${post.title}" /></td>
<td data-label="Title">${post.title}</td>
<td data-label="Author">${post.author}</td>
<td data-label="Genre">${post.genre}</td>
<td data-label="Date">${new Date(post.created_at).toLocaleDateString()}</td>
<td data-label="Actions">
  <button class="delete-btn" data-id="${post.id}">Delete</button>
  <button class="edit-btn" data-id="${post.id}">Edit</button>
</td>
    </tr>
  `,
    )
    .join("");

  // WE USE THE FOR EACH BUTTON TO ADD A CLICK EVENT LISTENER TO EACH DELETE BUTTON IN THE TABLE. WHEN A DELETE BUTTON IS CLICKED, IT CALLS THE deletePost FUNCTION WITH THE ID OF THE POST TO BE DELETED. THIS ALLOWS THE ADMIN TO DELETE POSTS DIRECTLY FROM THE TABLE VIEW.
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      // SHOW A LOADING STATE ON THE DELETE BUTTON TO PROVIDE FEEDBACK TO THE USER THAT THE DELETION IS IN PROGRESS. THIS ALSO HELPS PREVENT MULTIPLE CLICKS ON THE DELETE BUTTON, WHICH COULD LEAD TO UNINTENDED BEHAVIOR OR MULTIPLE DELETION REQUESTS.
      btn.textContent = "Deleting...";
      deletePost(btn.dataset.id);
    });
  });

  // Attach edit listeners
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => editPost(btn.dataset.id));
  });
}

// DELETE POST FUNCTION - THIS FUNCTION IS CALLED WHEN THE DELETE BUTTON IS CLICKED. IT FIRST ASKS FOR CONFIRMATION TO PREVENT ACCIDENTAL DELETION. IF THE USER CONFIRMS, IT SENDS A DELETE REQUEST TO SUPABASE TO REMOVE THE POST WITH THE SPECIFIED ID. IF THE DELETION IS SUCCESSFUL, IT REFRESHES THE POSTS LIST BY CALLING getPosts() AGAIN.
async function deletePost(id) {
  const confirm = window.confirm("Are you sure you want to delete this post?");
  if (!confirm) return;

  const { error } = await supabaseClient.from("posts").delete().eq("id", id);

  if (error) {
    console.error(error);
    alert("Failed to delete post");
    return;
  }

  getPosts();
}

// Edit post - redirect to admin.html with post id
function editPost(id) {
  // windows.location.href changes the current url
  window.location.href = `admin.html?edit=${id}`;
}

checkSession();
