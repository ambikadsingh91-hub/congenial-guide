// ============================================================
// LOT SHOP — FIREBASE VERSION
// Existing UI/style preserved
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyD89JlsSXpaAse-ZgUXnlUIqqlTPe-6Bys",
  authDomain: "lotapimain.firebaseapp.com",
  projectId: "lotapimain",
  storageBucket: "lotapimain.firebasestorage.app",
  messagingSenderId: "909823166989",
  appId: "1:909823166989:web:288001e0e37c2fa7282344"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let localListings = [];

let selectedItem = null;
let purchaseInProgress = false;


// ============================================================
// AUTH TAB SWITCHING
// ============================================================

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

  } else {

    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");

    loginTab.classList.remove("active");
    signupTab.classList.add("active");
  }
}


// ============================================================
// LOGIN
// ============================================================

async function login(event) {

  event.preventDefault();

  const usernameOrEmail =
    document.getElementById("loginUser").value.trim();

  const password =
    document.getElementById("loginPass").value;

  const message =
    document.getElementById("loginMessage");

  message.textContent = "";

  if (!usernameOrEmail || !password) {
    message.textContent = "Please enter your login details.";
    return;
  }

  try {

    let email = usernameOrEmail;

    // If user entered username instead of email,
    // find their email in Firestore.
    if (!usernameOrEmail.includes("@")) {

      const snapshot = await db
        .collection("users")
        .where("username", "==", usernameOrEmail)
        .limit(1)
        .get();

      if (snapshot.empty) {
        message.textContent =
          "Invalid username/email or password.";
        return;
      }

      email = snapshot.docs[0].data().email;
    }

    // Firebase Authentication handles the password.
    const credential =
      await auth.signInWithEmailAndPassword(
        email,
        password
      );

    await loadCurrentUser(credential.user.uid);

    enterMarketplace();

  } catch (error) {

    console.error(error);

    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {

      message.textContent =
        "Invalid username/email or password.";

    } else if (error.code === "auth/too-many-requests") {

      message.textContent =
        "Too many attempts. Please try again later.";

    } else {

      message.textContent =
        error.message || "Login failed.";
    }
  }
}


// ============================================================
// SIGN UP
// ============================================================

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

  if (username.toLowerCase() === "virat") {
    message.textContent =
      "That username is reserved.";
    return;
  }

  try {

    // Check username first.
    const usernameCheck = await db
      .collection("users")
      .where("username", "==", username)
      .limit(1)
      .get();

    if (!usernameCheck.empty) {
      message.textContent =
        "Username already exists.";
      return;
    }

    // Create Firebase Authentication account.
    const credential =
      await auth.createUserWithEmailAndPassword(
        email,
        password
      );

    const uid = credential.user.uid;

    // Create the Firestore user record.
    await db
      .collection("users")
      .doc(uid)
      .set({

        username: username,

        email: email,

        balance: 0,

        role: "user",

        purchases: 0,

        createdAt:
          firebase.firestore.FieldValue.serverTimestamp()
      });

    currentUser = {

      id: uid,

      username: username,

      email: email,

      balance: 0,

      role: "user",

      isAdmin: false,

      purchases: 0
    };

    enterMarketplace();

  } catch (error) {

    console.error(error);

    if (error.code === "auth/email-already-in-use") {

      message.textContent =
        "That email is already registered.";

    } else if (error.code === "auth/invalid-email") {

      message.textContent =
        "Enter a valid email address.";

    } else if (error.code === "auth/weak-password") {

      message.textContent =
        "Password must be at least 8 characters.";

    } else {

      message.textContent =
        error.message || "Signup failed.";
    }
  }
}


// ============================================================
// LOAD CURRENT USER
// ============================================================

async function loadCurrentUser(uid) {

  const doc =
    await db.collection("users").doc(uid).get();

  if (!doc.exists) {

    // Safety fallback if the Auth account has no
    // corresponding Firestore user document.
    throw new Error(
      "Your account exists, but your LOT Shop profile was not found."
    );
  }

  const data = doc.data();

  currentUser = {

    id: uid,

    username: data.username || "User",

    email: data.email || auth.currentUser.email,

    balance: Number(data.balance || 0),

    role: data.role || "user",

    isAdmin: data.role === "admin",

    purchases: Number(data.purchases || 0)
  };
}


// ============================================================
// OPEN MARKETPLACE
// ============================================================

async function enterMarketplace() {

  document
    .getElementById("authScreen")
    .classList.add("hidden");

  document
    .getElementById("app")
    .classList.remove("hidden");

  updateAccount();

  await loadListings();

  renderMarketplace();

  renderDashboard();
}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

  try {
    await auth.signOut();
  } catch (error) {
    console.error(error);
  }

  currentUser = null;
  localListings = [];

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


// ============================================================
// ACCOUNT
// ============================================================

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
    formatNumber(currentUser.balance);
}


// ============================================================
// LISTINGS
// ============================================================

async function loadListings() {

  try {

    const snapshot =
      await db
        .collection("listings")
        .orderBy("createdAt", "desc")
        .get();

    localListings =
      snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data()
      }));

  } catch (error) {

    console.error(error);

    // Fallback if old/test documents don't have createdAt.
    const snapshot =
      await db
        .collection("listings")
        .get();

    localListings =
      snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data()
      }));
  }
}


// ============================================================
// MARKETPLACE
// ============================================================

function renderMarketplace() {

  const container =
    document.getElementById("marketplaceItems");

  if (!container) return;

  const searchInput =
    document.getElementById("searchInput");

  const categoryInput =
    document.getElementById("categoryFilter");

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
        (item.name || "") +
        " " +
        (item.seller || "") +
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
          alt="${escapeHTML(item.name || "")}"
        >

        <div class="item-content">

          <h3>
            ${escapeHTML(item.name || "")}
          </h3>

          <p class="seller">
            Seller:
            ${escapeHTML(item.seller || "")}
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
            onclick="openPurchase('${item.id}')"
            ${Number(item.stock) <= 0 ? "disabled" : ""}
          >
            ${
              Number(item.stock) <= 0
                ? "Out of Stock"
                : "Buy Now"
            }
          </button>

        </div>

      </article>

    `).join("");
}


// ============================================================
// CREATE LISTING
// ============================================================

async function createListing() {

  if (!currentUser) {
    toast("Please login first.");
    return;
  }

  const name =
    document.getElementById("itemName").value.trim();

  const price =
    Number(
      document.getElementById("itemPrice").value
    );

  const stock =
    Number(
      document.getElementById("itemStock").value
    );

  const category =
    document.getElementById("itemCategory").value;

  const description =
    document.getElementById("itemDescription").value.trim();

  const file =
    document.getElementById("itemImage").files[0];

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

  try {

    toast("Publishing...");

    // Compress image so it can safely fit in Firestore.
    const imageData =
      await compressImage(file);

    const listing = {

      name: name,

      description: description,

      price: price,

      stock: stock,

      category: category,

      image: imageData,

      seller: currentUser.username,

      sellerId: currentUser.id,

      active: true,

      sold: 0,

      earned: 0,

      createdAt:
        firebase.firestore.FieldValue.serverTimestamp()
    };

    await db
      .collection("listings")
      .add(listing);

    document.getElementById("itemName").value = "";
    document.getElementById("itemPrice").value = "";
    document.getElementById("itemStock").value = "";
    document.getElementById("itemDescription").value = "";
    document.getElementById("itemImage").value = "";

    await loadListings();

    renderMarketplace();
    renderDashboard();

    toast("Item published!");

  } catch (error) {

    console.error(error);

    toast(
      error.message ||
      "Could not publish item."
    );
  }
}


// ============================================================
// IMAGE COMPRESSION
// ============================================================

function compressImage(file) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = function () {

      const img = new Image();

      img.onload = function () {

        const maxSize = 900;

        let width = img.width;
        let height = img.height;

        if (width > height) {

          if (width > maxSize) {
            height =
              Math.round(
                height * maxSize / width
              );

            width = maxSize;
          }

        } else {

          if (height > maxSize) {
            width =
              Math.round(
                width * maxSize / height
              );

            height = maxSize;
          }
        }

        const canvas =
          document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx =
          canvas.getContext("2d");

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        let quality = 0.75;

        let result =
          canvas.toDataURL(
            "image/jpeg",
            quality
          );

        // Keep reducing if necessary.
        while (
          result.length > 850000 &&
          quality > 0.25
        ) {

          quality -= 0.1;

          result =
            canvas.toDataURL(
              "image/jpeg",
              quality
            );
        }

        if (result.length > 900000) {
          reject(
            new Error(
              "Image is too large. Please use a smaller image."
            )
          );

          return;
        }

        resolve(result);
      };

      img.onerror = reject;

      img.src = reader.result;
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}


// ============================================================
// PURCHASE
// ============================================================

function openPurchase(id) {

  const item =
    localListings.find(
      x => x.id === id
    );

  if (!item) return;

  if (Number(item.stock) <= 0) {
    toast("Out of stock.");
    return;
  }

  if (
    item.sellerId === currentUser.id ||
    item.seller === currentUser.username
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
      Number(item.price)
    );

  document
    .getElementById("purchaseModal")
    .classList.add("active");
}


function closePurchase() {

  document
    .getElementById("purchaseModal")
    .classList.remove("active");

  selectedItem = null;
}


// ============================================================
// CONFIRM PURCHASE
// ============================================================

async function confirmPurchase() {

  if (
    purchaseInProgress ||
    !selectedItem ||
    !currentUser
  ) return;

  purchaseInProgress = true;

  const button =
    document.getElementById(
      "confirmPurchaseButton"
    );

  button.disabled = true;
  button.textContent = "Processing...";

  try {

    const buyerRef =
      db.collection("users")
        .doc(currentUser.id);

    const listingRef =
      db.collection("listings")
        .doc(selectedItem.id);

    await db.runTransaction(
      async transaction => {

        const listingDoc =
          await transaction.get(listingRef);

        if (!listingDoc.exists) {
          throw new Error(
            "Item no longer exists."
          );
        }

        const item =
          listingDoc.data();

        const price =
          Number(item.price || 0);

        const stock =
          Number(item.stock || 0);

        if (item.active === false) {
          throw new Error(
            "This listing is disabled."
          );
        }

        if (stock <= 0) {
          throw new Error(
            "Out of stock."
          );
        }

        if (
          item.sellerId === currentUser.id
        ) {
          throw new Error(
            "You cannot buy your own item."
          );
        }

        const buyerDoc =
          await transaction.get(buyerRef);

        if (!buyerDoc.exists) {
          throw new Error(
            "Buyer account not found."
          );
        }

        const buyer =
          buyerDoc.data();

        const buyerBalance =
          Number(buyer.balance || 0);

        if (buyerBalance < price) {
          throw new Error(
            "Insufficient LOT balance."
          );
        }

        // Seller account.
        const sellerRef =
          db.collection("users")
            .doc(item.sellerId);

        const sellerDoc =
          await transaction.get(sellerRef);

        if (!sellerDoc.exists) {
          throw new Error(
            "Seller account not found."
          );
        }

        const seller =
          sellerDoc.data();

        const sellerBalance =
          Number(seller.balance || 0);

        // Buyer loses LOT.
        transaction.update(
          buyerRef,
          {
            balance:
              buyerBalance - price,

            purchases:
              Number(buyer.purchases || 0) + 1
          }
        );

        // Seller receives LOT.
        transaction.update(
          sellerRef,
          {
            balance:
              sellerBalance + price
          }
        );

        // Update listing.
        transaction.update(
          listingRef,
          {
   
