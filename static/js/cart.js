const loadCartItems = () => {
    fetch(cartApiUrl)
        .then(response => response.json())
        .then(data => {
            const cartContainer = document.querySelector('#cart-items');

            if (data.message && data.message === "Your cart is empty.") {
                cartContainer.innerHTML = "<p>Your cart item is empty.</p>";
                return;
            }

            const selectCheckbox = document.createElement("input");
            selectCheckbox.setAttribute("type", "checkbox");
            selectCheckbox.setAttribute("id", "select-all");
            selectCheckbox.setAttribute("name", "select-all");
            selectCheckbox.setAttribute("value", "select-all-checkbox");
            cartContainer.appendChild(selectCheckbox);

            const selectCheckboxLabel = document.createElement("label");
            selectCheckboxLabel.setAttribute("for", "select-all");
            selectCheckboxLabel.textContent = "Select All";
            cartContainer.appendChild(selectCheckboxLabel);

            const deleteAll = document.createElement("button");
            deleteAll.classList.add("delete-selected-items");
            deleteAll.textContent = "Delete All";
            deleteAll.addEventListener('click', () => {
                // query selected items
                const allSelectedCheckboxes = document.querySelectorAll('input[name="selectedItems"]:checked');
                console.log("Total checkboxes:", document.querySelectorAll('input[name="selectedItems"]').length);
                console.log("Checked checkboxes:", allSelectedCheckboxes.length);

                let itemsToDelete = [];

                allSelectedCheckboxes.forEach(checkbox => {
                    console.log(checkbox.value);
                    if (checkbox.value && checkbox.value !== 'undefined') {
                        itemsToDelete.push(checkbox.value);
                    }
                });

                console.log("Items to delete:", itemsToDelete)
                if (itemsToDelete.length === 0) {
                    alert('Please select items to delete.');
                    return;
                }
                

                fetch('/delete_items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ product_ids: itemsToDelete })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.message && data.message === "Items deleted successfully.") {
                            allSelectedCheckboxes.forEach(checkbox => {
                                // remove the container for the deleted items
                                const removeElement = checkbox.closest('div');
                                cartContainer.removeChild(removeElement);
                                // TODO: clear out the total value in the cart
                            });
                            alert(data.message);
                        } else {
                            alert(`Failed to delete items: ${data.message}`)
                        }
                
                    })
                    .catch(error => console.error(`Error during deletion: ${error}`));
            });
            cartContainer.appendChild(deleteAll);

            const checkOut = document.createElement("button");
            checkOut.classList.add("checkout-selected-items");
            checkOut.textContent = "Checkout";
            checkOut.addEventListener('click', () => {

            })
            cartContainer.appendChild(checkOut);

            // Event listener for selectAll checkbox
            selectCheckbox.addEventListener('change', () => {
                const itemCheckboxes = document.querySelectorAll('input[name="selectedItems"]');
                itemCheckboxes.forEach(checkbox => {
                    checkbox.checked = selectCheckbox.checked;
                });
            });



            let total = 0;

            // update total
            const updateTotal = () => {
                const allPrices = document.querySelectorAll('p.price-total'); // Using class for item totals
                total = 0;
                allPrices.forEach(priceElement => {
                    total += parseFloat(priceElement.textContent.replace('Price Total: $', ''));
                });
                totalPrice.textContent = "Cart Total: $" + total.toFixed(2);
            }

            // const cartTotal = () => {
            //     const cartPrice = document.querySelectorAll('p.cart-total-price'); // Using class for item totals
            //     total = 0;
            //     cartPrice.forEach(priceElement => {
            //         total += parseFloat(priceElement.textContent.replace('Cart Total: $', ''));
            //     });
            //     totalPrice.textContent = "Cart Total: $" + total.toFixed(2);
            // }

            data.forEach(item => {
                // create a div for each item
                const itemDiv = document.createElement('div');
                // itemDiv.classList.add("col");

                const checkbox = document.createElement("input");
                checkbox.setAttribute("type", "checkbox");
                checkbox.setAttribute("name", "selectedItems");
                checkbox.setAttribute("value", item.product_id);

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
            totalPrice.setAttribute("id", "cart-total-price");
            totalPrice.textContent = "Cart Total: $" + total.toFixed(2);
            cartContainer.appendChild(totalPrice);

            updateTotal();
            // cartTotal()
            
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
    if (window.location.pathname === '/cart.html') {
        loadCartItems();
    }

    attachAddToCartEventListeners();
});

document.addEventListener('DOMContentLoaded', loadCartItems);
