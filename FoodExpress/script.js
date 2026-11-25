const foodItems = [
  { id:1, name:"Classic Burger", description:"Cheese burger with fresh vegetables", price:149, image:"🍔", restaurant:"Burger House" },
  { id:2, name:"Margherita Pizza", description:"Fresh tomato, mozzarella, and basil", price:299, image:"🍕", restaurant:"Pizza Palace" },
  { id:3, name:"French Fries", description:"Crispy golden potato fries", price:99, image:"🍟", restaurant:"Burger House" },
  { id:4, name:"Veg Noodles", description:"Hot noodles with fresh vegetables", price:179, image:"🍜", restaurant:"Noodle Point" },
  { id:5, name:"Chicken Biryani", description:"Aromatic rice with spicy chicken", price:249, image:"🍛", restaurant:"Spice Garden" },
  { id:6, name:"Chocolate Cake", description:"Soft cake with chocolate cream", price:129, image:"🍰", restaurant:"Sweet Treats" },
  { id:7, name:"Paneer Wrap", description:"Paneer, vegetables and mint sauce", price:159, image:"🌯", restaurant:"Green Bowl" },
  { id:8, name:"Masala Dosa", description:"Crispy dosa with potato masala", price:89, image:"🥞", restaurant:"South Tiffins" },
  { id:9, name:"Veg Fried Rice", description:"Fried rice with seasonal vegetables", price:169, image:"🍚", restaurant:"Noodle Point" }
];

const restaurants = [
  { name:"Burger House", type:"American", time:"25 min", image:"🍔" },
  { name:"Pizza Palace", type:"Italian", time:"30 min", image:"🍕" },
  { name:"Noodle Point", type:"Asian", time:"20 min", image:"🍜" },
  { name:"Spice Garden", type:"Indian", time:"28 min", image:"🍛" },
  { name:"Sweet Treats", type:"Desserts", time:"22 min", image:"🍰" },
  { name:"Green Bowl", type:"Healthy food", time:"25 min", image:"🥗" },
  { name:"South Tiffins", type:"South Indian", time:"18 min", image:"🥞" }
];

const deliveryPartners = ["Rahul", "Akhil", "Sanjay", "Kiran", "Arjun", "Vikram", "Manoj", "Ravi", "Teja", "Naveen", "Surya", "Harish"];
let cart = [];
let customer = null;
let pendingRegistration = null;
let savedAccounts = JSON.parse(localStorage.getItem("foodExpressAccounts") || "[]");
let demoOtp = "";
let assignedPartner = "";

const $ = id => document.getElementById(id);
const foodContainer = $("foodContainer");
const cartPanel = $("cartPanel");

function displayRestaurants(city) {
  $("restaurantCity").textContent = city;
  $("restaurantList").innerHTML = restaurants.map(r => `
    <div class="restaurant-card">
      <div class="restaurant-image">${r.image}</div>
      <h3>${r.name}</h3><p>${r.type} • ${r.time}</p>
      <p>Available in ${city}</p>
    </div>`).join("");
}

function displayFoodItems(items) {
  foodContainer.innerHTML = "";
  if (!items.length) {
    foodContainer.innerHTML = "<p>No matching food items found.</p>";
    return;
  }
  items.forEach(food => {
    const card = document.createElement("div");
    card.className = "food-card";
    card.innerHTML = `
      <div class="food-image">${food.image}</div>
      <h3>${food.name}</h3>
      <p>${food.description}</p>
      <p class="muted">${food.restaurant}</p>
      <div class="food-price">₹${food.price}</div>
      <button class="add-button">Add to Cart</button>`;
    card.querySelector("button").addEventListener("click", () => addToCart(food.id));
    foodContainer.appendChild(card);
  });
}

function addToCart(foodId) {
  if (!customer) {
    alert("Please register and verify your parent/guardian email first.");
    $("registerModal").classList.add("show");
    return;
  }
  const selectedFood = foodItems.find(food => food.id === foodId);
  cart.push(selectedFood);
  updateCart();
  alert(`${selectedFood.name} added to cart.`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function updateCart() {
  $("cartCount").textContent = cart.length;
  $("cartItems").innerHTML = "";
  let subtotal = 0;
  cart.forEach((item, index) => {
    subtotal += item.price;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `<div><strong>${item.image} ${item.name}</strong><p>₹${item.price}</p></div><button>Remove</button>`;
    row.querySelector("button").addEventListener("click", () => removeFromCart(index));
    $("cartItems").appendChild(row);
  });
  $("cartSubtotal").textContent = subtotal;
  $("cartTotal").textContent = subtotal + (cart.length ? 17 : 0);
  $("cartPriority").textContent = customer?.premium ? "⭐ Premium: priority processing + faster delivery" : "Regular order";
}

$("searchInput").addEventListener("input", event => {
  const query = event.target.value.toLowerCase().trim();
  displayFoodItems(foodItems.filter(food =>
    food.name.toLowerCase().includes(query) ||
    food.restaurant.toLowerCase().includes(query) ||
    food.description.toLowerCase().includes(query)
  ));
});

$("citySelect").addEventListener("change", event => displayRestaurants(event.target.value));
$("cartButton").addEventListener("click", () => cartPanel.classList.add("open"));
$("closeCart").addEventListener("click", () => cartPanel.classList.remove("open"));
$("accountButton").addEventListener("click", () => {
  if (customer) {
    alert(`You are logged in as ${customer.name}.`);
  } else {
    $("loginModal").classList.add("show");
  }
});
$("closeRegister").addEventListener("click", () => $("registerModal").classList.remove("show"));
$("closeLogin").addEventListener("click", () => $("loginModal").classList.remove("show"));
$("showLoginButton").addEventListener("click", () => {
  $("registerModal").classList.remove("show");
  $("loginModal").classList.add("show");
});
$("showRegisterButton").addEventListener("click", () => {
  $("loginModal").classList.remove("show");
  $("registerModal").classList.add("show");
});

$("loginForm").addEventListener("submit", event => {
  event.preventDefault();
  const email = $("loginEmail").value.trim().toLowerCase();
  const password = $("loginPassword").value;
  const account = savedAccounts.find(user =>
    user.email.toLowerCase() === email && user.password === password
  );

  if (!account) {
    alert("Account not found or password is incorrect. Please check your details or register.");
    return;
  }

  const { password: savedPassword, ...safeCustomerData } = account;
  customer = safeCustomerData;
  $("welcomeText").textContent = `Welcome back, ${customer.name}!`;
  $("accountStatus").textContent = customer.premium
    ? "⭐ Premium member • Priority processing and faster delivery"
    : `Logged in • ${customer.email}`;
  $("accountButton").textContent = "Account";
  $("loginModal").classList.remove("show");
  $("loginForm").reset();
  updateCart();
  alert("Login successful!");
});

$("registerForm").addEventListener("submit", event => {
  event.preventDefault();
  const age = Number($("customerAge").value);
  const email = $("customerEmail").value.trim();
  const parentEmail = $("parentEmail").value.trim();

  if (age < 10) {
    alert("Registration is allowed only for customers aged 10 or above.");
    return;
  }
  if (email.toLowerCase() === parentEmail.toLowerCase()) {
    alert("Please enter a different parent/guardian email address.");
    return;
  }

  pendingRegistration = {
    name: $("customerName").value.trim(),
    age,
    email,
    parentEmail,
    password: $("customerPassword").value,
    premium: $("premiumCheck").checked,
    city: $("citySelect").value
  };

  demoOtp = String(Math.floor(100000 + Math.random() * 900000));
  $("otpMessage").textContent = `Demo OTP for ${parentEmail}: ${demoOtp}. In a live system, this would be emailed securely.`;
  $("otpArea").classList.remove("hidden");
});

$("verifyOtpButton").addEventListener("click", () => {
  if (!pendingRegistration) return;
  if ($("otpInput").value.trim() !== demoOtp) {
    alert("Incorrect OTP. Please try again.");
    return;
  }
  const existingAccount = savedAccounts.some(user =>
    user.email.toLowerCase() === pendingRegistration.email.toLowerCase()
  );
  if (existingAccount) {
    alert("An account with this email already exists. Please log in instead.");
    $("registerModal").classList.remove("show");
    $("loginModal").classList.add("show");
    return;
  }

  savedAccounts.push(pendingRegistration);
  localStorage.setItem("foodExpressAccounts", JSON.stringify(savedAccounts));
  const { password: registeredPassword, ...safeCustomerData } = pendingRegistration;
  customer = safeCustomerData;
  $("welcomeText").textContent = `Welcome, ${customer.name}!`;
  $("accountStatus").textContent = customer.premium
    ? "⭐ Premium member • Priority processing and faster delivery"
    : `Registered customer • ${customer.email}`;
  $("accountButton").textContent = "Account Verified";
  $("registerModal").classList.remove("show");
  $("otpArea").classList.add("hidden");
  $("registerForm").reset();
  $("otpInput").value = "";
  pendingRegistration = null;
  updateCart();
  alert("Registration successful! Parent/guardian email verified (demo).");
});

$("checkoutButton").addEventListener("click", () => {
  if (!customer) {
    alert("Please register first.");
    $("registerModal").classList.add("show");
    return;
  }
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }
  assignedPartner = deliveryPartners[Math.floor(Math.random() * deliveryPartners.length)];
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + 17;
  const priority = customer.premium ? "Premium priority order" : "Regular order";
  alert(`Order placed successfully!\nCustomer: ${customer.name}\nType: ${priority}\nDelivery partner: ${assignedPartner}\nSubtotal: ₹${subtotal}\nGST: ₹17\nTotal: ₹${total}\nCity: ${customer.city}`);
  cart = [];
  updateCart();
  cartPanel.classList.remove("open");
});

displayRestaurants($("citySelect").value);
displayFoodItems(foodItems);
$("partnerCount").textContent = deliveryPartners.length;
updateCart();