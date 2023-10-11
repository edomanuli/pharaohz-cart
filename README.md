
# Pharaohz-Cart

The shopping cart project is designed to provide a convenient and user-friendly online shopping experience for a wide range of customers. This platform allows users to browse a catalog of products, select items of interest, and then manage their selections within a virtual shopping cart. Here's a brief description of what the project does and who it's for:

**Project Description:**
The shopping cart project is an e-commerce solution that enables users to perform the following actions:

1. **Product Selection:** Users can browse through a diverse selection of products presented in a clear and organized manner. They can view product details, including images, descriptions, and prices.

2. **Add to Cart:** Once users find items they wish to purchase, they can add them to their shopping cart with a simple click. The cart keeps track of the selected items and displays a running total.

3. **Edit Cart Contents:** Users have the flexibility to review and modify the contents of their shopping cart. They can adjust quantities, remove items they no longer want, or continue shopping.

4. **Checkout:** When ready, users can proceed to the checkout process, where they provide shipping and payment information. The system calculates the final cost.


**Target Audience:**
This shopping cart project is designed to cater to a broad audience:

- **Online Shoppers:** It serves individuals who prefer the convenience of online shopping, whether for everyday items or special purchases.

- **Tech-Savvy Users:** The project is user-friendly and accessible, making it suitable for users with various levels of technical expertise.

In summary, this shopping cart project simplifies the online shopping experience, offering a seamless way for users to explore, manage, and purchase products. It caters to a diverse audience, from everyday shoppers to businesses seeking to enhance their online sales capabilities.


## Acknowledgements


I would like to express my gratitude and appreciation to the following individuals and organizations who contributed to the success of this project:

- **Michael Landes**: For providing invaluable guidance and unwavering support throughout the project. Michael was always available to assist with challenges and provided expert direction in identifying and overcoming bottlenecks encountered during the project.

- **Ione Axelrod**: I'm grateful for their valuable insights and guidance on working with databases, particularly in implementing one-to-many and many-to-many relationships. Their expertise significantly enhanced the project's database functionality.

- **Hackbright Academy**: For providing me with the opportunity to learn and acquire valuable skills. Their platform played a pivotal role in my journey toward becoming a proficient software engineer.

- **Walmart**: I would like to express my gratitude to Walmart for sponsoring my program at Hackbright Academy. Their investment in my personal and professional growth has been instrumental in my development.

- **dummyjson**: The utilization of the dummyjson.com API greatly facilitated the process of populating products and efficiently saving them to my database.

- **Franklin**: I would like to express my heartfelt appreciation to my spouse for their unwavering support throughout this project and my learning journey. Your encouragement and understanding have been invaluable.

These contributions were instrumental in shaping and improving our project. I am eternally grateful for their dedication and assistance.
## Run Locally


Clone this repository to your local machine.

```bash
  git clone https://github.com/edomanuli/pharaohz-cart
```

Go to the project directory

```bash
  cd pharaohz-cart
```

Set Up Virtual Environment (Optional):

```bash
    python3 -m venv env

    source env/bin/activate 
     
    # On Windows, use `env\Scripts\activate`

```

Install dependencies

```bash
  pip install -r requirements.txt
```

## Database Setup
This application uses a PostgreSQL database. To set up the database on your local machine, follow the steps below:

1. **Install PostgreSQL:**

- Install PostgreSQL on your machine if you haven't already. You can download it from the https://www.postgresql.org/download/.

2. **Create the Database:**

- Create a new database named cart. You can do this using the createdb command:

```bash
    createdb cart
```

3. **Set the DATABASE_URL Environment Variable:**
- Set the **DATABASE_URL** environment variable to point to your database. 
- The format for a local socket connection is:

```bash
    export DATABASE_URL='postgresql:///cart'
```

- You can add the above line to your ~/.bash_profile or ~/.bashrc file to set the DATABASE_URL environment variable automatically in every new terminal session. 
- For example:

```bash
    echo "export DATABASE_URL='postgresql:///cart'" >> ~/.bashrc

    source ~/.bashrc
```

**Run the Application:**

- Now you're ready to run the application:

```bash
  python3 server.py
```

