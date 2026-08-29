/*
    LOT SHOP

    IMPORTANT:
    These are DEMO listings only.

    When your real LOT API is available,
    replace the API functions below.

    Do NOT use these demo balances
    for real LOT transactions.
*/


const API_BASE_URL = "";

let currentUser = null;
let selectedItem = null;


/* =========================
   DEMO DATA
========================= */

const demoItems = [

    {
        id: 1,
        name: "Golden Sword",
        seller: "Player123",
        price: 250,
        stock: 12,
        category: "weapons",
        image:
            "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80"
    },

    {
        id: 2,
        name: "Mystic Crystal",
        seller: "CrystalKing",
        price: 500,
        stock: 7,
        category: "collectibles",
        image:
            "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
    },

    {
        id: 3,
        name: "Shadow Hoodie",
        seller: "DarkPlayer",
        price: 150,
        stock: 25,
        category: "clothing",
        image:
            "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80"
    },

    {
        id: 4,
        name: "Legendary Gem",
        seller: "LotMaster",
        price: 1000,
        stock: 3,
        category: "collectibles",
        image:
            "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80"
    }

];


/* =========================
   DISPLAY ITEMS
========================= */

function displayItems(items) {

    const container = document.getElementById("items");

    if (!items.length) {

        container.innerHTML = `
            <p style="color:#888">
                No items found.
            </p>
        `;

        return;
    }


    container.innerHTML = items.map(item => `

        <div
            class="item-card"
            data-category="${item.category}"
            data-name="${item.name.toLowerCase()}"
        >

            <img
                class="item-image"
                src="${item.image}"
                alt="${escapeHTML(item.name)}"
            >

            <div class="item-content">

                <h3>
                    ${escapeHTML(item.name)}
                </h3>

                <p class="seller">
                    Seller: ${escapeHTML(item.seller)}
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
                    ${item.stock <= 0 ? "Out of Stock" : "Buy Now"}
                </button>

            </div>

        </div>

    `).join("");
}


/* =========================
   SEARCH
========================= */

function searchItems() {

    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();

    const category =
        document
            .getElementById("categoryFilter")
            .value;


    const filtered = demoItems.filter(item => {

        const matchesSearch =
            item.name
                .toLowerCase()
                .includes(search);

        const matchesCategory =
            category === "all" ||
            item.category === category;

        return matchesSearch && matchesCategory;

    });


    displayItems(filtered);
}


/* =========================
   CATEGORY FILTER
========================= */

function filterItems() {
    searchItems();
}


/* =========================
   LOGIN
========================= */

function openLogin() {

    document
        .getElementById("loginModal")
        .classList.add("active");

}


function closeLogin() {

    document
        .getElementById("loginModal")
        .classList.remove("active");

}


async function login() {

    const username =
        document
            .getElementById("username")
            .value
            .trim();

    const password =
        document
            .getElementById("password")
            .value;


    if (!username || !password) {

        showLoginMessage(
            "Please enter username and password."
        );

        return;
    }


    /*
        REAL API VERSION:

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

        currentUser = await response.json();
    */


    // DEMO ONLY
    if (
        username === "DemoUser" &&
        password === "demo1234"
    ) {

        currentUser = {

            username: "DemoUser",

            balance: 5000

        };


        closeLogin();

        showToast(
            "Logged in successfully!"
        );

        return;
    }


    showLoginMessage(
        "Invalid credentials. Demo: DemoUser / demo1234"
    );
}


function showLoginMessage(message) {

    document
        .getElementById("loginMessage")
        .textContent = message;

}


/* =========================
   PURCHASE
========================= */

function openPurchase(id) {

    selectedItem =
        demoItems.find(
            item => item.id === id
        );


    if (!selectedItem) return;


    if (!currentUser) {

        showToast(
            "Please login first."
        );

        openLogin();

        return;
    }


    document
        .getElementById("purchaseName")
        .textContent =
        `Purchase ${selectedItem.name}?`;


    document
        .getElementById("purchasePrice")
        .textContent =
        formatNumber(selectedItem.price);


    document
        .getElementById("purchaseStock")
        .textContent =
        selectedItem.stock;


    document
        .getElementById("purchaseBalance")
        .textContent =
        formatNumber(currentUser.balance);


    document
        .getElementById("purchaseModal")
        .classList.add("active");

}


function closePurchase() {

    document
        .getElementById("purchaseModal")
        .classList.remove("active");

}


async function confirmBuy() {

    if (!selectedItem || !currentUser)
        return;


    if (selectedItem.stock <= 0) {

        showToast(
            "This item is out of stock."
        );

        closePurchase();

        return;
    }


    if (
        currentUser.balance <
        selectedItem.price
    ) {

        showToast(
            "Insufficient LOT balance."
        );

        return;
    }


    /*
        REAL API PURCHASE:

        The server MUST verify:

        1. Current buyer balance
        2. Current listing price
        3. Current stock
        4. Listing ownership
        5. Atomic stock update
        6. Buyer debit
        7. Seller credit
        8. Transaction creation

        Never perform these operations
        only in JavaScript.
    */


    // DEMO ONLY

    currentUser.balance -=
        selectedItem.price;

    selectedItem.stock--;


    closePurchase();

    displayItems(demoItems);

    showToast(
        "Purchase successful!"
    );

}


/* =========================
   HELPERS
========================= */

function formatNumber(number) {

    return Number(number)
        .toLocaleString("en-US");

}


function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* =========================
   START
========================= */

displayItems(demoItems);
