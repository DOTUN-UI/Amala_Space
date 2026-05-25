const ADMIN_PASSWORD = "AmalaAdmin123";

const passwordGate = document.getElementById("password-gate");
const adminPanel = document.getElementById("admin-panel");
const loginBtn = document.getElementById("login-btn");
const passwordInput = document.getElementById("password-input");
const loginError = document.getElementById("login-error");

// WE'RE GONNA USE THIS WHEN WE WANT TO EDIT A POST.
const titleInput = document.getElementById("post-title");
const authorInput = document.getElementById("post-author");
const genreInput = document.getElementById("post-genre");
const contentInput = document.getElementById("post-content");
const currentImageContainer = document.getElementById(
  "current-image-container",
);
let editingPostId = null;

// NOW WE'RE CHECKING TO SEE IF THE ADMIN WANTS TO CREATE OR EDIT A POST BY LOOKING FOR THE EDIT PARAMS IN THE URL. A PARAMS OBJECT IS A DATA FIELD IN THE URL THAT CAN BE USED TO PASS INFORMATION
async function checkEditMode() {
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("edit");

  if (!editId) return;

  // NOW WE'LL FETCH THE POST FROM SUPABASE USING THE ID FROM THE EDIT PARAMS
  const { data, error } = await supabaseClient
    .from("posts")
    .select("*")
    .eq("id", editId)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  // NOW WE'LL PREFILL THE FORM WITH THE EXISTING POST DATA TO MAKE IT EASY FOR THE ADMIN TO EDIT. WE'LL ALSO CHANGE THE BUTTON TEXT AND HEADING TO REFLECT THAT WE'RE IN EDIT MODE. AND ALSO CHANGE THE H2 TO EDIT POST
  titleInput.value = data.title;
  authorInput.value = data.author;
  genreInput.value = data.genre;
  contentInput.value = data.content;
  uploadedImageUrl = data.image_url;
  currentImageContainer.innerHTML = `
  <p>Current Image:</p>
  <img src="${data.image_url}" alt="${data.title}" style="width: 6rem; height: 6rem; object-fit: cover; border-radius: 0.25rem;" />
`;
  document.getElementById("form-submit-post-btn").textContent = "Edit Post";
  document.querySelector("#admin-panel h2").textContent = "Edit Post";

  editingPostId = editId;
}

// CHECK SESSION CHECKS IF THE ADMIN IS ALREADY LOGGED IN BY LOOKING FOR A COOKIE. IF THE COOKIE EXISTS, IT SHOWS THE ADMIN PANEL AND HIDES THE PASSWORD GATE. IF NOT, IT SHOWS THE PASSWORD GATE AND HIDES THE ADMIN PANEL.
function checkSession() {
  const loggedIn = document.cookie
    .split("; ")
    .find((row) => row.startsWith("admin="));

  if (loggedIn) {
    passwordGate.style.display = "none";
    adminPanel.style.display = "flex";
    // WE'RE CHECKING THE EDIT MODE HERE TO SEE IF THE ADMIN WANTS TO EDIT A POST. IF THEY DO, WE PREFILL THE FORM WITH THE EXISTING POST DATA.
    checkEditMode();
  } else {
    passwordGate.style.display = "flex";
    adminPanel.style.display = "none";
  }
}

checkSession();

// LISTEN FOR LOGIN BUTTON CLICK AND VALIDATE PASSWORD. IF THE PASSWORD IS CORRECT, SET A COOKIE TO KEEP THE ADMIN LOGGED IN FOR 1 DAY. IF THE PASSWORD IS INCORRECT, SHOW AN ERROR MESSAGE.
loginBtn.addEventListener("click", () => {
  loginBtn.textContent = "Logging in...";
  const entered = passwordInput.value.trim();

  if (entered === ADMIN_PASSWORD) {
    // "COOKIE VALUE;MAX-AGE IN SECONDS;PATH WHERE COOKIE IS AVAILABLE =/"
    document.cookie = "admin=true; max-age=86400; path=/";
    checkSession();
  } else {
    loginBtn.textContent = "Log in";
    loginError.textContent = "Incorrect password";
  }
});

// UPLOADING IMAGES TO SUPABASE STORAGE BUCKET
const uploadBtn = document.getElementById("upload-image-btn");
const imageInput = document.getElementById("post-image");

let uploadedImageUrl = null;

// WE'RE GETTING THE FILE UPLOADED BY THE ADMIN HERE TO UPLOAD IT TO THE SUPABASE STORAGE BUCKET
uploadBtn.addEventListener("click", async () => {
  // DISABLE THE BUTTON AND SHOW A LOADING STATE WHILE THE IMAGE IS BEING UPLOADED TO PROVIDE FEEDBACK TO THE USER AND PREVENT MULTIPLE CLICKS THAT COULD LEAD TO UNINTENDED BEHAVIOR OR MULTIPLE UPLOADS.
  uploadBtn.textContent = "Uploading...";
  uploadBtn.disabled = true;

  const file = imageInput.files[0];

  // CHECK FOR ACTUAL FILE
  if (!file) {
    alert("Please select an image first");
    return;
  }

  // DATE.NOW TO ENSURE UNIQUE FILENAME IN THE BUCKET TO AVOID OVERWRITING EXISTING FILES IF THERE ARE CLASHING NAMES
  const filename = `${Date.now()}-${file.name}`;

  // UPLOADING TO BUCKET AND THE PROMISE RETURNS AN OBJECT WITH EITHER THE DATA OF THE FILE OR AN ERROR IF UPLOAD FAILS
  const { data, error } = await supabaseClient.storage
    .from("blog-images")
    // .UPLOAD EXPECTS 2 ARGUMENTS: THE FILENAME TO BE USED IN THE BUCKET, AND THE FILE ITSELF
    .upload(filename, file);

  if (error) {
    console.error(error);
    alert("Upload failed");
    return;
  }

  const {
    // DESTRUCTURING THE DATA OBJECT TO GET THE URL OF THE UPLOADED IMAGE DIRECTLY
    data: { publicUrl },
  } = supabaseClient.storage.from("blog-images").getPublicUrl(filename);

  uploadedImageUrl = publicUrl;

  // SHOW PREVIEW AND SUCCESS MESSAGE
  const imageDiv = document.getElementById("form-image");
  imageDiv.innerHTML = `
  <div id="upload-success">
    <img src="${publicUrl}" alt="Uploaded image" style="width: 100px; height: 100px; object-fit: cover; border-radius: 0.25rem;" />
    <p style="color: green; font-size: 0.8rem; margin-top: 0.5rem;">✓ Image uploaded successfully</p>
  </div>
`;

  console.log("Image URL:", uploadedImageUrl);
});

const formSubmitBtn = document.getElementById("form-submit-post-btn");

// GETTING THE ERROR ELEMENTS TO SHOW VALIDATION MESSAGES TO THE USER IF THEY FAIL TO FILL OUT THE FORM CORRECTLY
const titleError = document.querySelector(".title-error");
const authorError = document.querySelector(".author-error");
const genreError = document.querySelector(".genre-error");
const imageError = document.querySelector(".image-error");
const contentError = document.querySelector(".content-error");

formSubmitBtn.addEventListener("click", async () => {
  formSubmitBtn.textContent = editingPostId
    ? "Editing Post..."
    : "Creating Post...";

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const genre = genreInput.value.trim();
  const author = authorInput.value.trim();

  // CLEAR ALL ERRORS FIRST
  titleError.textContent = "";
  authorError.textContent = "";
  genreError.textContent = "";
  imageError.textContent = "";
  contentError.textContent = "";

  let valid = true;

  // TITLE: BETWEEN 3 AND 10 WORDS
  const titleWords = title.split(" ").filter((w) => w !== "").length;
  //   SINCE THIS ISN'T A NATURAL FORM, WE HAVE TO ADD MANUAL VALIDATION TO CHECK THE INPUTS
  if (!title) {
    titleError.textContent = "Title is required";
    valid = false;
  } else if (titleWords < 3 || titleWords > 10) {
    titleError.textContent = "Title must be between 3 and 10 words";
    valid = false;
  }

  // AUTHOR: MAX 30 CHARACTERS
  if (!author) {
    authorError.textContent = "Author is required";
    valid = false;
  } else if (author.length > 30) {
    authorError.textContent = "Author must be 30 characters or less";
    valid = false;
  }

  // GENRE: MUST BE SELECTED
  if (!genre) {
    genreError.textContent = "Please select a genre";
    valid = false;
  }

  // IMAGE: MUST BE UPLOADED
  if (!uploadedImageUrl) {
    imageError.textContent = "Please upload an image";
    valid = false;
  }

  // CONTENT: BETWEEN 30 AND 250 WORDS
  const contentWords = content.split(" ").filter((w) => w !== "").length;
  if (!content) {
    contentError.textContent = "Content is required";
    valid = false;
  } else if (contentWords < 30) {
    contentError.textContent = "Content must be at least 30 words";
    valid = false;
  } else if (contentWords > 250) {
    contentError.textContent = "Content must be 250 words or less";
    valid = false;
  }

  if (!valid) {
    formSubmitBtn.textContent = editingPostId ? "Edit Post" : "Create Post";
    return;
  }
  //   CHECKING IF EDIT POST IF EXISTS TO CHOOSE THE CRUD OPERATION TO USE {EDIT OR CREATE}
  if (editingPostId) {
    const { data, error } = await supabaseClient
      .from("posts")
      .update({
        title,
        content,
        author,
        genre,
        image_url: uploadedImageUrl,
      })
      .eq("id", editingPostId);
    if (error) {
      console.log(error);
      alert("Failed to update post");
      formSubmitBtn.textContent = "Update Post";
      return;
    }
    alert("Post updated successfully!");
    window.location.href = "admin-posts.html";
  } else {
    const { data, error } = await supabaseClient.from("posts").insert([
      {
        title,
        content,
        author,
        genre,
        image_url: uploadedImageUrl,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Failed to submit post");
      return;
    }

    alert("Post submitted successfully!");
    window.location.href = "admin-posts.html";
  }
});
