r) {

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
