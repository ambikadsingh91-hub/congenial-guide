/*
====================================================
LOT SHOP
====================================================

DEVELOPMENT VERSION

IMPORTANT:
The real LOT API is NOT connected yet.

The functions in the API SERVICE LAYER below are
structured so the real API can be connected later.

DO NOT use the demo authentication/balance system
for real LOT transactions.

====================================================
*/


/* ================================================
   API CONFIGURATION
================================================ */

const API_BASE_URL = "";


/* ================================================
   DEMO ADMIN
================================================

IMPORTANT:
This is ONLY a development demo.

Never put a real production admin password
inside frontend JavaScript.

Production admin authentication must come
from the backend/API.
*/

const DEMO_ADMIN_USERNAME = "Virat";
const DEMO_ADMIN_PASSWORD = "9825727203";


/* ================================================
   APPLICATION STATE
================================================ */

let currentUser = null;
let selectedItem = null;
let purchaseInProgress = false;


/* ================================================
   LOCAL DEVELOPMENT DATA
================================================ */

let localUsers =
  JSON.parse(localStorage.getItem("lot_users") || "[]");

let localListings =
  JSON.parse(localStorage.getItem("lot_listings") || "[]");


/* ================================================
   API SERVICE LAYER
================================================

Replace these functions with your real API calls
when you provide the API documentation.

DO NOT put API calls directly throughout the UI.
*/


async function loginUser(username, password) {

  /*
  REAL API EXAMPLE:

  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        username,
        password
      })
    }
  );

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  return await response.json();
  */


  return null;
}


async function signupUser(username, email, password) {

  /*
  PLACEHOLDER:

  Replace with your real registration endpoint.

  Example:

  POST /auth/signup

  {
    username,
    email,
    password
  }
  */

  return null;
}


async function logoutUser() {

  /*
  PLACEHOLDER:

  POST /auth/logout
  */

}


async function getCurrentUser() {

  /*
  PLACEHOLDER:

  GET /auth/me
  */

  return null;
}


async function getLotBalance() {

  /*
  PLACEHOLDER:

  GET /users/me/balance

  The real API must return the current
  LOT balance.

  NEVER trust a balance sent only by
  the frontend.
  */

  return null;
}


async function getListings() {

  /*
  PLACEHOLDER:

  GET /listings
  */

  return [];
}


async function createListingAPI(data) {

  /*
  PLACEHOLDER:

  POST /listings

  The backend must verify:
  - authenticated user
  - ownership
  - price
  - stock
  - category
  */

  return null;
}


async function updateListing(id, data) {

  /*
  PLACEHOLDER:

  PATCH /listings/:id
  */

  return null;
}


async function deleteListingAPI(id) {

  /*
  PLACEHOLDER:

  DELETE /listings/:id
  */

  return null;
}


async function uploadItemImage(file) {

  /*
  PLACEHOLDER:

  POST /uploads/item-image

  The backend should validate:
  - file type
  - file size
  - file contents

  and return a permanent image URL.
  */

  return null;
}


async function purchaseItem(id) {

  /*
  PLACEHOLDER:

  POST /listings/:id/purchase

  IMPORTANT:

  The server must atomically:

  1. Verify buyer.
  2. Verify listing.
  3. Verify current price.
  4. Verify current stock.
  5. Verify buyer balance.
  6. Debit buyer.
  7. Credit seller.
  8. Reduce stock.
  9. Create transaction.

  This MUST NOT be performed only by frontend JS.
  */

  return null;
}


async function getTransactions() {

  /*
  PLACEHOLDER:

  GET /transactions
  */

  return [];
}


/* ================================================
   AUTHENTICATION UI
================================================ */

function showAuth(type) {

  const loginForm =
    document.getElementById("loginForm");

  const signupForm =
    document.getElementById("signupForm");

  const loginTab =
    document.getElementById("loginTab");

  const signupTab =
    document.getElementById("signupTab");


  loginForm.classList.toggle(
    "hidden",
    type !== "login"
  );

  signupForm.classList.toggle(
    "hidden",
    type !== "signup"
  );


  loginTab.classList.toggle(
    "active",
    type === "login"
  );

  signupTab.classList.toggle(
    "active",
    type === "signup"
  );
}


/* ================================================
   LOGIN
================================================ */

async function login(event) {

  event.preventDefault();


  const username =
    document
      .getElementById("loginUser")
      .value
      .trim();


  const password =
    document
      .getElementById("loginPass")
      .value;


  const message =
    document.getElementById("loginMessage");


  message.textContent = "";


  if (!username || !password) {

    message.textContent =
      "Please enter your login details.";

    return;
  }


  /*
  DEMO ADMIN ONLY
  */

  if (
    username === DEMO_ADMIN_USERNAME &&
    password === DEMO_ADMIN_PASSWORD
  ) {

    currentUser = {

      id: "demo-admin",

      username: "Virat",

      balance: 100000,

      role: "admin",

      isAdmin: true

    };


    sessionStorage.setItem(
      "lot_current_user",
      JSON.stringify(currentUser)
    );


    enterMarketplace();

    toast("Admin login successful.");

    return;
  }


  /*
  REAL API
  */

  try {

    const apiUser =
      await loginUser(username, password);


    if (apiUser) {

      currentUser = apiUser;

      sessionStorage.setItem(
        "lot_current_user",
        JSON.stringify(currentUser)
      );

      await enterMarketplace();

      return;
    }


    /*
    DEVELOPMENT-ONLY LOCAL USERS
    */

    const user =
      localUsers.find(
        item =>
          (
            item.username.toLowerCase() ===
            username.toLowerCase() ||
            item.email.toLowerCase() ===
            username.toLowerCase()
          ) &&
          item.password === password
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

      isAdmin: false

    };


    sessionStorage.setItem(
      "lot_current_user",
      JSON.stringify(currentUser)
    );


    enterMarketplace();

    toast("Welcome back, " + user.username);

  } catch (error) {

    message.textContent =
      "Unable to login. Please try again.";

  }

}


/* ================================================
   SIGN UP
================================================ */

async function signup(event) {

  event.preventDefault();


  const username =
    document
      .getElementById("signupUser")
      .value
      .trim();


  const email =
    document
      .getElementById("signupEmail")
      .value
      .trim();


  const password =
    document
      .getElementById("signupPass")
      .value;


  const confirm =
    document
      .getElementById("signupConfirm")
      .value;


  const message =
    document.getElementById("signupMessage");


  message.textContent = "";


  if (username.length < 3) {

    message.textContent =
      "Username must be at least 3 characters.";

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


  try {

    const apiUser =
      await signupUser(
        username,
        email,
        password
      );


    if (apiUser) {

      currentUser = apiUser;

      sessionStorage.setItem(
        "lot_current_user",
        JSON.stringify(currentUser)
      );

      enterMarketplace();

      return;
    }


    /*
    DEVELOPMENT LOCAL ACCOUNT
    */

    if (
      localUsers.some(
        user =>
          user.username.toLowerCase() ===
          username.toLowerCase()
      )
    ) {

      message.textContent =
        "Username already exists.";

      return;
    }


    const user = {

      id: Date.now(),

      username,

      email,

      password,

      balance: 0

    };


    localUsers.push(user);


    localStorage.setItem(
      "lot_users",
      JSON.stringify(localUsers)
    );


    currentUser = {

      id: user.id,

      username,

      balance: 0,

      role: "user",

      isAdmin: false

    };


    sessionStorage.setItem(
      "lot_current_user",
      JSON.stringify(currentUser)
    );


    enterMarketplace();

    toast("Account created successfully.");

  } catch (error) {

    message.textContent =
      "Unable to create account.";

  }

}


/* ================================================
   ENTER MARKETPLACE
================================================ */

async function enterMarketplace() {

  document
    .getElementById("authScreen")
    .classList.add("hidden");


  document
    .getElementById("app")
    .classList.remove("hidden");


  updateAccount();


  try {

    const apiUser =
      await getCurrentUser();


    if (apiUser) {

      currentUser = {
        ...currentUser,
        ...apiUser
      };

    }


    const balance =
      await getLotBalance();


    if (balance !== null) {

      currentUser.balance =
        Number(balance);

    }

  } catch (error) {

    console.log(
      "API not connected yet."
    );

  }


  updateAccount();

  await loadListings();

  renderMarketplace();

  renderDashboard();

}


/* ================================================
   LOGOUT
================================================ */

async function logout() {

  try {

    await logoutUser();

  } catch (error) {

    console.log(error);

  }


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


  showAuth("login");

  toast("Logged out.");
}


/* ================================================
   ACCOUNT DISPLAY
================================================ */

function updateAccount() {

  if (!currentUser) return;


  document
    .getElementById("usernameDisplay")
    .textContent =
    currentUser.username +
    (currentUser.isAdmin ? " • Admin" : "");


  document
    .getElementById("balanceDisplay")
    .textContent =
    formatNumber(currentUser.balance);

}


/* ================================================
   LISTINGS
================================================ */

async function loadListings() {

  try {

    const apiListings =
      await getListings();


    if (
      Array.isArray(apiListings) &&
      apiListings.length
    ) {

      localListings =
        apiListings;

      return;
    }

  } catch (error) {

    console.log(error);

  }


  localListings =
    JSON.parse(
      localStorage.getItem(
        "lot_listings"
      ) || "[]"
    );
}


/* ================================================
   MARKETPLACE
================================================ */

function renderMarketplace() {

  const container =
    document.getElementById(
      "marketplaceItems"
    );


  const search =
    document
      .getElementById("searchInput")
      .value
      .toLowerCase();


  const category =
    document
      .getElementById("categoryFilter")
      .value;


  const listings =
    localListings.filter(item => {

      if (item.active === false)
        return false;


      const text =
        (
          item.name +
          " " +
          item.seller +
          " " +
          item.description
        ).toLowerCase();


      const matchesSearch =
        text.includes(search);


      const matchesCategory =
        category === "all" ||
        item.category === category;


      return (
        matchesSearch &&
        matchesCategory
      );

    });


  if (!listings.length) {

    container.innerHTML = `
      <div class="empty">
        <h3>No items found</h3>
        <p class="muted">
          There are currently no matching listings.
        </p>
      </div>
    `;

    return;
  }


  container.innerHTML =
    listings
      .map(createItemCard)
      .join("");
}


/* ================================================
   ITEM CARD
================================================ */

function createItemCard(item) {

  return `

    <article class="item-card">

      <img
        class="item-image"
        src="${escapeHTML(item.image)}"
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

          <div>

            <div class="price">
              ${formatNumber(item.price)} LOT
            </div>

            <div class="stock">
              Stock: ${item.stock}
            </div>

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

  `;
}


/* ================================================
   CREATE LISTING
================================================ */

async function createListing() {

  const name =
    document
      .getElementById("itemName")
      .value
      .trim();


  const price =
    Number(
      document
        .getElementById("itemPrice")
        .value
    );


  const stock =
    Number(
      document
        .getElementById("itemStock")
        .value
    );


  const category =
    document
      .getElementById("itemCategory")
      .value;


  const description =
    document
      .getElementById("itemDescription")
      .value
      .trim();


  const file =
    document
      .getElementById("itemImage")
      .files[0];


  if (!name) {

    toast("Enter an item name.");

    return;
  }


  if (price <= 0) {

    toast("Price must be greater than 0.");

    return;
  }


  if (stock <= 0) {

    toast("Stock must be greater than 0.");

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


  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];


  if (!allowedTypes.includes(file.type)) {

    toast("Only JPG, PNG and WEBP images are allowed.");

    return;
  }


  try {

    /*
    REAL API IMAGE UPLOAD
    */

    const uploadedImage =
      await uploadItemImage(file);


    if (uploadedImage) {

      const listing =
        await createListingAPI({

          name,

          description,

          price,

          stock,

          category,

          image: uploadedImage

        });


      if (listing) {

        await loadListings();

        renderMarketplace();

        renderDashboard();

        toast("Listing published.");

        return;
      }

    }

  } catch (error) {

    console.log(
      "Real API upload unavailable."
    );

  }


  /*
  DEVELOPMENT-ONLY LOCAL IMAGE
  */

  const reader =
    new FileReader();


  reader.onload = function () {

    const listing = {

      id: Date.now(),

      name,

      description,

      price,

      stock,

      category,

      image: reader.result,

      seller:
        currentUser.username,

      sellerId:
        currentUser.id,

      active: true,

      sold: 0,

      earned: 0

    };


    localListings.push(
      listing
    );


    localStorage.setItem(
      "lot_listings",
      JSON.stringify(localListings)
    );


    clearListingForm();

    renderMarketplace();

    renderDashboard();

    toast("Listing published.");

  };


  reader.readAsDataURL(file);
}


/* ================================================
   CLEAR LISTING FORM
================================================ */

function clearListingForm() {

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

}


/* ================================================
   PURCHASE MODAL
================================================ */

function openPurchase(id) {

  const item =
    localListings.find(
      listing => listing.id === id
    );


  if (!item) return;


  selectedItem = item;


  document.getElementById(
    "purchaseName"
  ).textContent =
    "Purchase " +
    item.name +
    "?";


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
    formatNumber(
      currentUser.balance
    );


  document.getElementById(
    "purchaseRemaining"
  ).textContent =
    formatNumber(
      currentUser.balance -
      item.price
    );


  document
    .getElementById("purchaseModal")
    .classList.add("active");
}


/* ================================================
   CLOSE PURCHASE
================================================ */

function closePurchase() {

  document
    .getElementById("purchaseModal")
    .classList.remove("active");


  selectedItem = null;
}


/* ================================================
   PURCHASE
================================================ */

async function confirmPurchase() {

  if (
    purchaseInProgress ||
    !selectedItem
  ) {

    return;
  }


  purchaseInProgress = true;


  const button =
    document.getElementById(
      "confirmPurchaseButton"
    );


  button.disabled = true;

  button.textContent =
    "Processing...";


  const item =
    localListings.find(
      listing =>
        listing.id === selectedItem.id
    );


  if (!item) {

    toast("Item no longer exists.");

    resetPurchaseButton();

    return;
  }


  if (item.stock <= 0) {

    toast("This item is out of stock.");

    resetPurchaseButton();

    closePurchase();

    return;
  }


  if (
    item.seller ===
    currentUser.username
  ) {

    toast(
      "You cannot buy your own item."
    );

    resetPurchaseButton();

    return;
  }


  /*
  REAL API PURCHASE
  */

  try {

    const result =
      await purchaseItem(
        item.id
      );


    if (result) {

      if (result.balance !== undefined) {

        currentUser.balance =
          result.balance;

      }


      await loadListings();

      updateAccount();

      renderMarketplace();

      renderDashboard();

      closePurchase();

      toast(
        "Purchase successful!"
      );

      resetPurchaseButton();

      return;
    }

  } catch (error) {

    console.log(
      "Real purchase API unavailable."
    );

  }


  /*
  DEVELOPMENT-ONLY LOCAL PURCHASE
  */

  if (
    currentUser.balance <
    item.price
  ) {

    toast(
      "Ins
