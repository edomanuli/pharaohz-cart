// // Create a fetch wrapper

// class FetchWrapper {
//     constructor(baseURL) {
//         this.baseURL = baseURL
//     }

//     get(endpoint) {
//         return fetch(this.baseURL + endpoint)
//             .then(response => response.json())
//     }

//     put(endpoint, body) {
//         return this.#send("put", endpoint, body)
//     }

//     post(endpoint, body) {
//         return this.#send("post", endpoint, body)
//     }

//     delete(endpoint, body) {
//         return this.#send("delete", endpoint, body)
//     }

//     #send(method, endpoint, body) {
//         return fetch(this.baseURL + endpoint, {
//             method,
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify(body)
//         }).then(response => response.json())
//     }
// }