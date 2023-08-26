"""Flask Server"""
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
import requests

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql:///cart"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


@app.route('/')
@app.route('/home')
def home():
    """render homepage"""
    return render_template('homepage.html')

@app.route('/products')
def product():
    """render products"""
    return render_template('products.html', title='Products')

@app.route('/register')
def register():
    """render registration page"""
    return render_template('register.html', title='Registration')

@app.route('/login')
def login():
    """render login page"""
    return render_template('login.html', title='Login')

@app.route('/cart')
def cart():
    """render login page"""
    return render_template('cart.html', title='Cart')

@app.route('/api/api_products')
def api_products():
    """Fetching external products info"""
    response = requests.get('https://fakestoreapi.com/products')
    # print(response.status_code)
    data = response.json()
    return data





if __name__ == '__main__':
    app.run(debug=True)
