const loadCartItems = () => {
    fetch(cartApiUrl)
        .then(response => response.json())
        .then(data => {
            const cartContainer = document.querySelector('#cart-products');

            if (data.message && data.message === "Your cart is empty.") {
                cartContainer.innerHTML = "<p>Your cart item is empty.</p>";
                return;
            }

            const selectCheckbox = document.createElement("input");
            selectCheckbox.setAttribute("type", "checkbox");
            selectCheckbox.setAttribute("id", "select-all");
            selectCheckbox.classList.add("sticky-container")
            selectCheckbox.setAttribute("name", "select-all");
            selectCheckbox.setAttribute("value", "select-all-checkbox");
            cartContainer.appendChild(selectCheckbox);

            


            const selectCheckboxLabel = document.createElement("label");
            selectCheckboxLabel.setAttribute("for", "select-all");
            selectCheckboxLabel.classList.add("select-all-label", "sticky-container")
            selectCheckboxLabel.textContent = "Select";
            cartContainer.appendChild(selectCheckboxLabel);

            

            const deleteAll = document.createElement("button");
            deleteAll.classList.add("delete-selected-items", "sticky-container");
            deleteAll.textContent = "Delete";
            deleteAll.addEventListener('click', () => {
                // query selected items
                const allSelectedCheckboxes = document.querySelectorAll('input[name="selectedItems"]:checked');

                let itemsToDelete = [];

                allSelectedCheckboxes.forEach(checkbox => {
                    if (checkbox.value && checkbox.value !== 'undefined') {
                        itemsToDelete.push(checkbox.value);
                    }
                });

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
                                
                                const totalPrice = document.getElementById('cart-total-price');
                                location.reload()
                                totalPrice.textContent = "Total: " + total.toFixed(2);
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
            checkOut.classList.add("checkout-selected-items", "sticky-container");
            checkOut.textContent = "Checkout";
            checkOut.addEventListener('click', () => {
                const selectedCheckboxes = document.querySelectorAll('input[name="selectedItems"]:checked');

                let itemsToPay = [];
                let totalSelectedAmount = 0;

                selectedCheckboxes.forEach(checkbox => {
                    if (checkbox.value && checkbox.value !== 'undefined') {
                        itemsToPay.push(checkbox.value);

                        const itemDiv = checkbox.closest('div');
                        const priceElement = itemDiv.querySelector('.price-total');
                        const itemPrice = parseFloat(priceElement.textContent.replace('Price: $', ''));
                        totalSelectedAmount += itemPrice;

                    }
                });

                if (itemsToPay.length === 0) {
                    alert('Please select items to Checkout.');
                    return;
                }

                // hide cart container
                const cartHolder = document.getElementById('cart-products');
                cartHolder.style.display = 'none';

                // update total amount in checkout
                const checkoutTotalAmount = document.getElementById('totalAmount');
                checkoutTotalAmount.textContent = `Total Amount: $${totalSelectedAmount.toFixed(2)}`;

                // show checkout form
                const checkoutForm = document.querySelector('.checkout-form');
                checkoutForm.style.display = 'block';

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
                    total += parseFloat(priceElement.textContent.replace('Price: $', ''));
                });
                totalPrice.textContent = "Total: $" + total.toFixed(2);
            }


            data.forEach(item => {
                // create a div for each item
                const itemDiv = document.createElement('div');
                itemDiv.classList.add("product-card", "container");
                // itemDiv.classList.add("col");

                const checkbox = document.createElement("input");
                checkbox.setAttribute("type", "checkbox");
                checkbox.setAttribute("name", "selectedItems");
                checkbox.setAttribute("value", item.product_id);
                itemDiv.appendChild(checkbox);


                const image = document.createElement("img");
                image.setAttribute("src", item.product.thumbnail);
                image.setAttribute("alt", item.product.title);
                image.setAttribute("width", "175");
                image.setAttribute("height", "150");
                itemDiv.appendChild(image)

                const title = document.createElement("h4");
                title.textContent = item.product.title;
                itemDiv.appendChild(title);

                const quantity = document.createElement("p");
                let itemQuantity = item.quantity;
                quantity.textContent = "Qty: " + itemQuantity;
                itemDiv.appendChild(quantity);

                // how to remove the item from cartContainer when quantity is 0
                

                const price = document.createElement("p");
                price.classList.add('price-total')
                let itemTotalPrice = item.product.price * itemQuantity;
                price.textContent = "Price: $" + itemTotalPrice.toFixed(2);
                itemDiv.appendChild(price);

                const increment = document.createElement("button");
                increment.classList.add("increase", "d-flex", "flex-wrap", "justify-content-evenly")
                increment.textContent = "+";
                increment.addEventListener('click', () => {
                    itemQuantity++;
                    quantity.textContent = "Qty: " + itemQuantity;
                    itemTotalPrice = item.product.price * itemQuantity;
                    price.textContent = "Price: $" + itemTotalPrice.toFixed(2);

                    updateTotal();
                })
                itemDiv.appendChild(increment);

                const decrement = document.createElement("button");
                decrement.classList.add("decrease", "d-flex", "flex-wrap", "justify-content-evenly")
                decrement.textContent = "-";
                decrement.addEventListener('click', () => {
                    if (itemQuantity > 0) {
                        itemQuantity--;
                        quantity.textContent = "Qty: " + itemQuantity;
                        itemTotalPrice = item.product.price * itemQuantity;
                        price.textContent = "Price: $" + itemTotalPrice;

                        updateTotal();
                    } else if (itemQuantity <= 0) {
                        // remove the item from cartContainer
                        const removeElement = decrement.closest('div');
                        cartContainer.removeChild(removeElement);
                    }
                })
                itemDiv.appendChild(decrement);


                // Append to the container
                cartContainer.appendChild(itemDiv);
            });

            const totalPrice = document.createElement('p')
            totalPrice.setAttribute("id", "cart-total-price");
            totalPrice.textContent = "Total: $" + total.toFixed(2);
            cartContainer.appendChild(totalPrice);

            updateTotal();
            // cartTotal()
            
        })
        .catch(error => console.error("There was an error fetching cart items:", error))
}


// add products to cart on button click
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


// display the product details when the details button is clicked
document.addEventListener('DOMContentLoaded', () => {
    // dialog elements
    const dialog = document.querySelector('.dialog-container dialog');
    const image = dialog.querySelector('.product-image');
    const title = dialog.querySelector('.dialog-body h3');
    const price = dialog.querySelector('.dialog-body h4');
    const stock = dialog.querySelector('.dialog-body p.stock');
    const description = dialog.querySelector('.dialog-body p.description');

    const detailsButton = document.querySelectorAll('.detailsButton');

    detailsButton.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();

            const productId = event.currentTarget.getAttribute('data-product-id');

            fetchProduct(productId).then(product => {
                image.src = product.thumbnail;
                title.textContent = `Title: ${product.title}`;
                price.textContent = `Price: $${product.price}`;
                stock.textContent = `Quantity: ${product.stock_quantity}`;
                description.textContent = `Product Description: ${product.title}`;

                // show the dialog
                document.querySelector('.dialog-container').classList.add('active');
                dialog.showModal();
            })


        })
    })

    const fetchProduct = (productId) => {
        return fetch(`/product_details/${productId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network error, please try again");
                }
                return response.json();
            });
    }

    // close the dialog 
    const buttonClose = dialog.querySelector('button[type="submit"]');
    buttonClose.addEventListener('click', event => {
        event.preventDefault();
        document.querySelector('.dialog-container').classList.remove('active');
        dialog.close();
    })
})



const attachAddToCartEventListeners = () => {
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

    addToCartBtns.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
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

const checkoutBtn = document.querySelector('.checkout-btn');

checkoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    alert("Uh oh, unfortunately we can't process payments right now!")
})

document.addEventListener('DOMContentLoaded', loadCartItems);

