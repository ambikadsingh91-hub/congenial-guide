// LOT SHOP - FIXED AUTHENTICATION VERSION

let currentUser = null;

const DEMO_ADMIN_USERNAME = "Virat";
const DEMO_ADMIN_PASSWORD = "9825727203";

let localUsers = JSON.parse(
  localStorage.getItem("lot_users") || "[]"
);

let localListings = JSON.parse(
  localStorage.getItem("lot_listings") || "[]"
);


// ===============================
// AUTH TAB SWITCHING
// ===============================

function showAuth(type) {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  const loginTab = document.getElementById("loginTab");
  const signupTab = document.getElementById("signupTab");

  if (type === "login") {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");

    loginTab.classList.add("active");
    signupTab.classList.remove("active");
  }

  if (type === "signup") {
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");

    loginTab.classList.remove("active");
    signupTab.classList.add("active");
  }
}


// ===============================
// LOGIN
// ===============================

async function login(event) {
  event.preventDefault();

  const username =
    document.getElementById("loginUser").value.trim();

  const password =
    document.getElementById("loginPass").value;

  const message =
    document.getElementById("loginMessage");

  message.textContent = "";

  if (!username || !password) {
    message.textContent = "Please enter your login details.";
    return;
  }


  // DEMO ADMIN LOGIN

  if (
    username.toLowerCase() ===
      DEMO_ADMIN_USERNAME.toLowerCase() &&
    password === DEMO_ADMIN_PASSWORD
  ) {

    currentUser = {
      id: "admin-virat",
      username: "Virat",
      balance: 100000,
      role: "admin",
      isAdmin: true,
      purchases: 0
    };

    sessionStorage.setItem(
      "lot_current_user",
      JSON.stringify(currentUser)
    );

    enterMarketplace();

    return;
  }


  // LOCAL DEVELOPMENT USER

  const user = localUsers.find(
    u =>
      (
        u.username.toLowerCase() ===
          username.toLowerCase() ||
        u.email.toLowerCase() ===
          username.toLowerCase()
      ) &&
      u.password === password
  );


  if (!user) {
    message.textContent =
      "Invalid username/email or password.";
    return;
  }


  currentUser = {
    id: user.id,
    username: user.username,
    balance: user.balance || 0,
    role: "user",
    isAdmin: false,
    purchases: user.purchases || 0
  };


  sessionStorage.setItem(
    "lot_current_user",
    JSON.stringify(currentUser)
  );


  enterMarketplace();
}


// ===============================
// SIGN UP
// ===============================

async function signup(event) {
  event.preventDefault();

  const username =
    document.getElementById("signupUser").value.trim();

  const email =
    document.getElementById("signupEmail").value.trim();

  const password =
    document.getElementById("signupPass").value;

  const confirm =
    document.getElementById("signupConfirm").value;

  const message =
    document.getElementById("signupMessage");

  message.textContent = "";


  if (username.length < 3) {
    message.textContent =
      "Username must be at least 3 characters.";
    return;
  }


  if (!email.includes("@")) {
    message.textContent =
      "Enter a valid email address.";
    return;
  }


  if (password.length < 8) {
    message.textContent =
      "Password must be at least 8 characters.";
    return;
  }


  if (password !== confirm) {
    message.textContent =
      "Passwords do not match.";
    return;
  }


  if (
    username.toLowerCase() ===
    DEMO_ADMIN_USERNAME.toLowerCase()
  ) {
    message.textContent =
      "That username is reserved.";
    return;
  }


  const alreadyExists = localUsers.some(
    u =>
      u.username.toLowerCase() ===
        username.toLowerCase() ||
      u.email.toLowerCase() ===
        email.toLowerCase()
  );


  if (alreadyExists) {
    message.textContent =
      "Username or email already exists.";
    return;
  }


  const user = {
    id: Date.now().toString(),
    username: username,
    email: email,
    password: password,
    balance: 0,
    purchases: 0
  };


  localUsers.push(user);


  localStorage.setItem(
    "lot_users",
    JSON.stringify(localUsers)
  );


  currentUser = {
    id: user.id,
    username: user.username,
    balance: 0,
    role: "user",
    isAdmin: false,
    purchases: 0
  };


  sessionStorage.setItem(
    "lot_current_user",
    JSON.stringify(currentUser)
  );


  enterMarketplace();
}


// ===============================
// OPEN MARKETPLACE
// ===============================

function enterMarketplace() {

  document
    .getElementById("authScreen")
    .classList.add("hidden");

  document
    .getElementById("app")
    .classList.remove("hidden");


  updateAccount();

  loadListings();

  renderMarketplace();

  renderDashboard();
}


// ===============================
// LOGOUT
// ===============================

function logout() {

  currentUser = null;

  sessionStorage.removeItem(
    "lot_current_user"
  );


  document
    .getElementById("app")
    .classList.add("hidden");

  document
    .getElementById("authScreen")
    .classList.remove("hidden");


  document.getElementById("loginUser").value = "";
  document.getElementById("loginPass").value = "";

  showAuth("login");
}


// ===============================
// ACCOUNT
// ===============================

function updateAccount() {

  if (!currentUser) return;

  document.getElementById(
    "usernameDisplay"
  ).textContent =
    currentUser.username +
    (currentUser.isAdmin ? " • Admin" : "");


  document.getElementById(
    "balanceDisplay"
  ).textContent =
    Number(currentUser.balance || 0)
      .toLocaleString("en-US");
}


// ===============================
// LISTINGS
// ===============================

function loadListings() {

  localListings = JSON.parse(
    localStorage.getItem(
      "lot_listings"
    ) || "[]"
  );
}


// ===============================
// MARKETPLACE
// ===============================

function renderMarketplace() {

  const container =
    document.getElementById(
      "marketplaceItems"
    );

  if (!container) return;


  const searchInput =
    document.getElementById(
      "searchInput"
    );

  const categoryInput =
    document.getElementById(
      "categoryFilter"
    );


  const search =
    searchInput
      ? searchInput.value.toLowerCase()
      : "";


  const category =
    categoryInput
      ? categoryInput.value
      : "all";


  const listings =
    localListings.filter(item => {

      if (item.active === false)
        return false;


      const text = (
        item.name +
        " " +
        item.seller +
        " " +
        (item.description || "")
      ).toLowerCase();


      const searchMatch =
        text.includes(search);


      const categoryMatch =
        category === "all" ||
        item.category === category;


      return (
        searchMatch &&
        categoryMatch
      );
    });


  if (!listings.length) {

    container.innerHTML = `
      <div style="
        grid-column:1/-1;
        text-align:center;
        padding:60px;
      ">
        <h3>No items found</h3>
        <p class="muted">
          There are currently no listings.
        </p>
      </div>
    `;

    return;
  }


  container.innerHTML =
    listings.map(item => `

      <article class="item-card">

        <img
          class="item-image"
          src="${escapeHTML(item.image || "")}"
          alt="${escapeHTML(item.name)}"
        >

        <div class="item-content">

          <h3>
            ${escapeHTML(item.name)}
          </h3>

          <p class="seller">
            Seller:
            ${escapeHTML(item.seller)}
          </p>

          <p class="seller">
            ${escapeHTML(item.description || "")}
          </p>

          <div class="item-bottom">

            <div class="price">
              ${formatNumber(item.price)} LOT
            </div>

            <div class="stock">
              Stock: ${item.stock}
            </div>

          </div>

          <button
            class="buy-btn"
            onclick="openPurchase(${item.id})"
            ${item.stock <= 0 ? "disabled" : ""}
          >
            ${
              item.stock <= 0
                ? "Out of Stock"
                : "Buy Now"
            }
          </button>

        </div>

      </article>

    `).join("");
}


// ===============================
// CREATE LISTING
// ===============================

function createListing() {

  if (!currentUser) {
    toast("Please login first.");
    return;
  }


  const name =
    document.getElementById(
      "itemName"
    ).value.trim();


  const price =
    Number(
      document.getElementById(
        "itemPrice"
      ).value
    );


  const stock =
    Number(
      document.getElementById(
        "itemStock"
      ).value
    );


  const category =
    document.getElementById(
      "itemCategory"
    ).value;


  const description =
    document.getElementById(
      "itemDescription"
    ).value.trim();


  const file =
    document.getElementById(
      "itemImage"
    ).files[0];


  if (!name) {
    toast("Enter an item name.");
    return;
  }


  if (price <= 0) {
    toast("Enter a valid price.");
    return;
  }


  if (stock <= 0) {
    toast("Enter a valid stock amount.");
    return;
  }


  if (!file) {
    toast("Please select an image.");
    return;
  }


  if (file.size > 5 * 1024 * 1024) {
    toast("Image must be under 5MB.");
    return;
  }


  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];


  if (!allowed.includes(file.type)) {
    toast("Only JPG, PNG and WEBP are allowed.");
    return;
  }


  const reader =
    new FileReader();


  reader.onload = function () {

    const listing = {

      id: Date.now(),

      name: name,

      description: description,

      price: price,

      stock: stock,

      category: category,

      image: reader.result,

      seller: currentUser.username,

      sellerId: currentUser.id,

      active: true,

      sold: 0,

      earned: 0
    };


    localListings.push(listing);


    localStorage.setItem(
      "lot_listings",
      JSON.stringify(localListings)
    );


    document.getElementById(
      "itemName"
    ).value = "";

    document.getElementById(
      "itemPrice"
    ).value = "";

    document.getElementById(
      "itemStock"
    ).value = "";

    document.getElementById(
      "itemDescription"
    ).value = "";

    document.getElementById(
      "itemImage"
    ).value = "";


    renderMarketplace();

    renderDashboard();

    toast("Item published!");
  };


  reader.readAsDataURL(file);
}


// ===============================
// PURCHASE
// ===============================

let selectedItem = null;
let purchaseInProgress = false;


function openPurchase(id) {

  const item =
    localListings.find(
      x => x.id === id
    );


  if (!item) return;


  if (item.stock <= 0) {
    toast("Out of stock.");
    return;
  }


  if (
    item.seller ===
    currentUser.username
  ) {
    toast("You cannot buy your own item.");
    return;
  }


  selectedItem = item;


  document.getElementById(
    "purchaseName"
  ).textContent =
    "Purchase " + item.name + "?";


  document.getElementById(
    "purchasePrice"
  ).textContent =
    formatNumber(item.price);


  document.getElementById(
    "purchaseStock"
  ).textContent =
    item.stock;


  document.getElementById(
    "purchaseBalance"
  ).textContent =
    formatNumber(currentUser.balance);


  document.getElementById(
    "purchaseRemaining"
  ).textContent =
    formatNumber(
      currentUser.balance -
      item.price
    );


  document
    .getElementById(
      "purchaseModal"
    )
    .classList.add("active");
}


function closePurchase() {

  document
    .getElementById(
      "purchaseModal"
    )
    .classList.remove("active");

  selectedItem = null;
}


function confirmPurchase() {

  if (
    purchaseInProgress ||
    !selectedItem
  ) return;


  purchaseInProgress = true;


  const button =
    document.getElementById(
      "confirmPurchaseButton"
    );


  button.disabled = true;
  button.textContent = "Processing...";


  const item =
    localListings.find(
      x => x.id === selectedItem.id
    );


  if (!item) {

    toast("Item no longer exists.");

    finishPurchase();

    return;
  }


  if (item.stock <= 0) {

    toast("Out of stock.");

    finishPurchase();

    return;
  }


  if (
    currentUser.balance <
    item.price
  ) {

    toast("Insufficient LOT balance.");

    finishPurchase();

    return;
  }


  currentUser.balance -=
    item.price;


  item.stock--;

  item.sold =
    (item.sold || 0) + 1;

  item.earned =
    (item.earned || 0) +
    item.price;


  localStorage.setItem(
    "lot_listings",
    JSON.stringify(localListings)
  );


  sessionStorage.setItem(
    "lot_current_user",
    JSON.stringify(currentUser)
  );


  updateAccount();

  renderMarketplace();

  renderDashboard();

  closePurchase();

  toast("Purchase successful!");


  finishPurchase();
}


function finishPurchase() {

  purchaseInProgress = false;

  const button =
    document.getElementById(
      "confirmPurchaseButton"
    );

  if (button) {

    button.disabled = false;

    button.textContent =
      "Confirm Purchase";
  }
}


// ===============================
// DASHBOARD
// ===============================

function renderDashboard() {

  if (!currentUser) return;


  const mine =
    localListings.filter(
      item =>
        item.seller ===
        currentUser.username
    );


  const stats =
    document.getElementById(
      "stats"
    );


  if (stats) {

    stats.innerHTML = `

      <div class="stat">
        <small class="muted">
          Balance
        </small>
        <b>
          ${formatNumber(currentUser.balance)}
        </b>
      </div>

      <div class="stat">
        <small class="muted">
          Listings
        </small>
        <b>
          ${mine.length}
        </b>
      </div>

      <div class="stat">
        <small class="muted">
          Purchases
        </small>
        <b>
          ${currentUser.purchases || 0}
        </b>
      </div>

      <div class="stat">
        <small class="muted">
          Sales
        </small>
        <b>
          ${mine.reduce(
            (a, x) => a + (x.sold || 0),
            0
          )}
        </b>
      </div>

    `;
  }


  const listings =
    document.getElementById(
      "myListings"
    );


  if (!listings) return;


  if (!mine.length) {

    listings.innerHTML =
      `<p class="muted">
        You have no listings yet.
      </p>`;

    return;
  }


  listings.innerHTML =
    mine.map(item => `

      <div class="listing-row">

        <div>

          <b>
            ${escapeHTML(item.name)}
          </b>

          <br>

          <small class="muted">

            ${formatNumber(item.price)}
            LOT ·

            Stock:
            ${item.stock}

            · Sold:
            ${item.sold || 0}

          </small>

        </div>

        <button
          class="secondary"
          onclick="toggleListing(${item.id})"
        >
          ${
            item.active === false
              ? "Enable"
              : "Disable"
          }
        </button>

        <button
          class="danger"
          onclick="removeListing(${item.id})"
        >
          Remove
        </button>

      </div>

    `).join("");
}


// ===============================
// LISTING CONTROLS
// ===============================

function toggleListing(id) {

  const item =
    localListings.find(
      x => x.id === id
    );


  if (!item) return;


  if (
    !currentUser.isAdmin &&
    item.seller !==
      currentUser.username
  ) {

    toast("You cannot modify this listing.");

    return;
  }


  item.active =
    item.active === false;


  localStorage.setItem(
    "lot_listings",
    JSON.stringify(localListings)
  );


  renderMarketplace();

  renderDashboard();

  toast(
    item.active
      ? "Listing enabled."
      : "Listing disabled."
  );
}


function removeListing(id) {

  const item =
    localListings.find(
      x => x.id === id
    );


  if (!item) return;


  if (
    !currentUser.isAdmin &&
    item.seller !==
      currentUser.username
  ) {

    toast("You cannot remove this listing.");

    return;
  }


  if (
    !confirm(
      `Remove "${item.name}"?`
    )
  ) return;


  localListings =
    localListings.filter(
      x => x.id !== id
    );


  localStorage.setItem(
    "lot_listings",
    JSON.stringify(localListings)
  );


  renderMarketplace();

  renderDashboard();

  toast("Listing removed.");
}


// ===============================
// UTILITIES
// ===============================

function formatNumber(number) {

  return Number(
    number || 0
  ).toLocaleString("en-US");
}


function escapeHTML(value) {

  return String(
    value || ""
  ).replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]
  );
}


function toast(message) {

  const element =
    document.getElementById(
      "toast"
    );


  if (!element) {
    alert(message);
    return;
  }


  element.textContent =
    message;


  element.classList.add(
    "show"
  );


  setTimeout(
    () =>
      element.classList.remove(
        "show"
      ),
    2500
  );
}


// ===============================
// STARTUP
// ===============================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const saved =
      sessionStorage.getItem(
        "lot_current_user"
      );


    if (saved) {

      try {

        currentUser =
          JSON.parse(saved);

        enterMarketplace();

      } catch {

        sessionStorage.removeItem(
          "lot_current_user"
        );

        showAuth("login");
      }

    } else {

      showAuth("login");

    }

  }
);
