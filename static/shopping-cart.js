// import FetchWrapper from "./wrapper";


document.addEventListener("DOMContentLoaded", () => {
    const cardTemplate = document.querySelector('.card-template');
    const container = document.querySelector('.container .row');

    const populateProduct = (card, product) => {
        const image = card.querySelector('#product-image');
        const title = card.querySelector('#product-name');
        const price = card.querySelector('.card-text')

        image.src = product.image // Replace 'image' with the actual property name when ready
        title.textContent = product.title // Replace 'name' with the actual property name
        price.textContent = `$${product.price}`

    }
    // Fetch product data using the FetchWrapper instance
    // const API = new FetchWrapper(apiBaseUrl)

    fetch('/api/api_products')
        .then(response => response.json())
        .then(result => {
            // console.log(data)
            
            result.forEach(product => {
                console.log(product)
                const newCard = cardTemplate.cloneNode(true);
                newCard.classList.remove('card-template');
                newCard.classList.add('col');

                populateProduct(newCard, product);
                container.appendChild(newCard)
            });
        })
        .catch(error => {
            console.error('Error getting data:', error)
        });
})


