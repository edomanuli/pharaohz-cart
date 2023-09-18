const loadCartItems = () => {
    fetch(cartApiUrl)
        .then(response => response.json())
        .then(data => {
            const cartContainer = document.querySelector('#cart-items');

            if (data.message && data.message === "Your cart is empty.") {
                cartContainer.innerHTML = "<p>Your cart item is empty.</p>";
                return;
            }


            let total = 0;

            // update total
            const updateTotal = () => {
                const allPrices = document.querySelectorAll('p.price-total'); // Using class for item totals
                total = 0;
                allPrices.forEach(priceElement => {
                    total += parseFloat(priceElement.textContent.replace('Price Total: $', ''));
                });
                totalPrice.textContent = "Total: $" + total.toFixed(2);
            }

            data.forEach(item => {
                // create a div for each item
                const itemDiv = document.createElement('div');
                // itemDiv.classList.add("col");

                const checkbox = document.createElement("input");
                checkbox.setAttribute("type", "checkbox");
                checkbox.setAttribute("name", "selectedItems");
                checkbox.setAttribute("value", item.product.id);
                itemDiv.appendChild(checkbox);

                const title = document.createElement("h4");
                title.textContent = item.product.title;
                itemDiv.appendChild(title);

                const image = document.createElement("img");
                image.setAttribute("src", item.product.thumbnail);
                image.setAttribute("alt", item.product.title);
                image.setAttribute("width", "250");
                itemDiv.appendChild(image)

                const quantity = document.createElement("p");
                let itemQuantity = item.quantity;
                quantity.textContent = "Quantity: " + itemQuantity;
                itemDiv.appendChild(quantity);

                const price = document.createElement("p");
                price.classList.add('price-total')
                let itemTotalPrice = item.product.price * itemQuantity;
                price.textContent = "Price Total: $" + itemTotalPrice.toFixed(2);
                itemDiv.appendChild(price);

                const increment = document.createElement("button");
                increment.classList.add("increase")
                increment.textContent = "+";
                increment.addEventListener('click', () => {
                    itemQuantity++;
                    quantity.textContent = "Quantity: " + itemQuantity;
                    itemTotalPrice = item.product.price * itemQuantity;
                    price.textContent = "Price Total: $" + itemTotalPrice.toFixed(2);

                    updateTotal();
                })
                itemDiv.appendChild(increment);

                const decrement = document.createElement("button");
                decrement.classList.add("decrease")
                decrement.textContent = "-";
                decrement.addEventListener('click', () => {
                    if (itemQuantity > 0) {
                        itemQuantity--;
                        quantity.textContent = "Quantity: " + itemQuantity;
                        itemTotalPrice = item.product.price * itemQuantity;
                        price.textContent = "Price Total: $" + itemTotalPrice;

                        updateTotal();
                    }
                })
                itemDiv.appendChild(decrement);


                // Append to the container
                cartContainer.appendChild(itemDiv);
            });

            const totalPrice = document.createElement('p')
            totalPrice.setAttribute("id", "total-price");
            totalPrice.textContent = "Cart Total: $" + total.toFixed(2);
            cartContainer.appendChild(totalPrice);

            updateTotal();

            
        })
        .catch(error => console.error("There was an error fetching cart items:", error))
}



const addToCart = (productId, buttonEl) => {
    buttonEl.disabled = true;

    fetch('/add-to-cart', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ product_id: productId })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message)

                // check if it's the crt page beore reloading items
                if (window.location.pathname === '/cart.html') {
                    loadCartItems();
                }
            }
        })
        .catch(error => console.error('Error:', error))
}

const attachAddToCartEventListeners = () => {
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

    addToCartBtns.forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = parseInt(event.currentTarget.getAttribute('data-product-id'));

            addToCart(productId, event.currentTarget);
        })
    })
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/templates/cart.html') {
        loadCartItems();
        attachCartEventListeners();
    }

    attachAddToCartEventListeners();
});

document.addEventListener('DOMContentLoaded', loadCartItems);
