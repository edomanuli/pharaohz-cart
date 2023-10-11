
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

