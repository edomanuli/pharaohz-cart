document.addEventListener("DOMContentLoaded", () => {
    // const cardTemplate = document.querySelector('.card-template');
    // const container = document.querySelector('.container .row');
    // const dialog = document.querySelector("dialog");

    // const populateProduct = (card, product) => {
    //     const image = card.querySelector('#product-image');
        const title = card.querySelector('#product-name');
    //     const price = card.querySelector('.card-text');
    //     const detailsButton = card.querySelector("#detailsButton");

    //     image.src = product.images[0];
    //     title.textContent = product.title;
    //     price.textContent = `$${product.price}`;
        
    //     // Setting the product ID dynamically to the "View Details" button
    //     detailsButton.setAttribute("data-product-id", product.id);
    // }

    // const showProductDetails = (product) => {
    //     dialog.innerHTML = `
    //         <img src=${product.thumbnail} alt="Product Image" id="product-image">
    //         <div class="dialog-body">
    //             <h2>Title: ${product.title}</h2>
    //             <h3>Price: $${product.price}</h3>
    //             <h4>Stock Quantity: ${product.stock}</h4>
    //             <p>Product Description: ${product.description}</p>
    //         </div>
    //         <form method="dialog">
    //             <button type="submit" class="button">Close</button>
    //         </form>
    //     `;
    //     dialog.showModal();
    // }

    // Fetch product list
    // fetch('/products')
    //     .then(response => response.json())
    //     .then(data => {
            
    //         data.products.forEach(product => {
    //             const newCard = cardTemplate.cloneNode(true);
    //             newCard.classList.remove('card-template');
    //             newCard.classList.add('col');

    //             populateProduct(newCard, product);
    //             container.appendChild(newCard);
    //         });
    //     })
    //     .catch(error => {
    //         console.error('Error getting data:', error);
    //     });

    // Event listener for "View Details" button
    container.addEventListener("click", event => {
        if (event.target.id === "detailsButton") {
            const productId = event.target.getAttribute("data-product-id");

            fetch(`/api/api_products/${productId}`)
                .then(response => response.json())
                .then(product => showProductDetails(product))
                .catch(error => console.error('Error fetching product details:', error));
        }
    });

     // Event Listener for Add to cart button
     container.addEventListener("click", event => {
        if (event.target.classList.contains("add-to-cart-btn")) {
            // Extract the product ID from the button's data attribute
            const productId = event.target.getAttribute("data-product-id")

            // Send a POST request to your Flask API to add the product to the cart
            fetch("/add-to-cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({product_id: productId})
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data.message)

                    const cartProducts = document.getElementById("cart-products")
                    // Update cart contents
                    fetch("/cart")
                        .then(response => response.json())
                        .then(html => {
                            cartProducts.innerHTML = html
                        })
                })
        }
    })


});



