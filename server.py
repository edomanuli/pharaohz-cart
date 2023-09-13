"""Flask Server"""
import os
import secrets
import requests
from PIL import Image
from flask import Flask, render_template, jsonify, request, url_for, flash, redirect
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, login_user, current_user, logout_user, login_required
from forms import RegistrationForm, LoginForm, UpdateAccountForm
from models import db, User, Product, Cart, CartItem, Order, connect_to_db



app = Flask(__name__)
app.secret_key = '36611c84dffb8c4d1dbd2d642025ba70'
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
@app.route('/home')
def home():
    """render homepage"""
    return render_template('homepage.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    """Render registration page"""
    if current_user.is_authenticated:
        return redirect(url_for('products'))
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_passw = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        user = User (
            first_name=form.first_name.data, 
            last_name=form.last_name.data, 
            username=form.username.data, 
            email= form.email.data, 
            password=hashed_passw
            )
        db.session.add(user)
        db.session.commit()
        flash('Your account has been created! Please log in.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Render login page"""
    if current_user.is_authenticated:
        return redirect(url_for('products'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user, remember=form.remember.data)
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('products'))
        else:
            flash('Login Unsuccessful. Please check email and password', 'danger')
    return render_template('login.html', title='Login', form=form)


@app.route('/logout')
def logout():
    """Logout route"""
    logout_user()
    return redirect(url_for('home'))



def save_image(form_picture):
    """Save user's uploaded image"""
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(app.root_path, 'static/images', picture_fn)
    
    output_size = (125, 125)
    image = Image.open(form_picture)
    image.thumbnail(output_size)
    
    image.save(picture_path)
    
    return picture_fn
    

@app.route('/account', methods=['GET', 'POST'])
@login_required
def account():
    """Account route"""
    form = UpdateAccountForm()
    if form.validate_on_submit():
        if form.picture.data:
            picture_file = save_image(form.picture.data)
            current_user.image_file = picture_file
        current_user.username = form.username.data
        current_user.email = form.email.data
        db.session.commit()
        flash('Account Updated!', 'success')
        return redirect(url_for('account'))
    elif request.method == 'GET':
        form.username.data = current_user.username
        form.email.data = current_user.email
    image_file = url_for('static', filename='images/' + current_user.image_file)
    return render_template('account.html', title='Account', image_file=image_file, form=form)


@app.route('/update_products_from_api', methods=['GET'])
def update_products_from_api():
    """Saving the products from the API unto the database"""
    url = "https://dummyjson.com/products"
    response = requests.get(url)
    
    if response.status_code == 200:
        products_data = response.json()["products"]
        
        for item in products_data:
            # Check that product exist
            product_id = int(item['id'])
            product = Product.query.get(product_id)
            
            if product:
                # update product details
                product.title = item['title']
                product.price = item['price']
                product.thumbnail = item['thumbnail']
                product.description = item['description']
                product.stock_quantity = item['stock']
                product.category = item['category']
            else:
                # Create product if it doesn't exist
                new_product = Product(
                    id=item['id'],
                    title=item['title'],
                    price=item['price'],
                    description=item['description'],
                    thumbnail=item['thumbnail'],
                    stock_quantity=item['stock'],
                    category=item['category']
                )
                db.session.add(new_product)
                
        # Commit the changes to the database
        db.session.commit()
        
        return jsonify({"message": "Products updated successfully"})
    else:
        return jsonify({"error": "Failed to fetch data from API"}), 500
    

@app.route('/api/local_products', methods=['GET'])
def get_local_products():
    """Fetching products from the database"""
    local_products = Product.query.all()
    return jsonify([product.to_dict() for product in local_products])

@app.route('/products')
def products():
    """Render products from the database"""
    all_products = Product.query.all()
    return render_template('products.html', title='Products', products=all_products)
            

@app.route('/add-to-cart', methods=["POST"])
def add_to_cart():
    """Add to Cart"""
    if request.method == 'POST':
        # Get product_id from the request json
        product_id = request.json.get('product_id')
        print(product_id)
        
        # fetch product details from the API
        api_url = f'https://dummyjson.com/products/{product_id}'
        response = requests.get(api_url)
        
        if response.status_code == 200:
            product_data = response.json()
            
            # create a new cart item based on the product details
            new_cart_item = CartItem(
                product_id=product_data['id'],
                quantity=1
            )
            
            db.session.add(new_cart_item)
            # db.session.commit()
            print(new_cart_item)
            # Add cart item to user's cart
            # user_id = Users.user_id
            # user = Users.query.get(user_id)
            
            # if user:
            #     user.cart.cart_items.append(new_cart_item)
            #     db.session.commit()
            
            # Add item to cart
            # session['cart'].append(new_cart_item)
            return jsonify({"message": "Product added to cart"})
        else:
            return jsonify({"message": "Failed to fetch product data"}), 500
    else:
        return jsonify({"message": "Invalid request method"}), 405

  
@app.route('/cart')
def view_cart():
    """render login page"""
    # retrieve the list of items in the card from the cart items table,  cart = [the list]
    # start with a list of products
    # then update to a key-value (dictionary) where key is the product, and the value is the count of that product
    # also need to compute the total price of items in the cart
    return render_template('cart.html', title='Cart')
    
if __name__ == '__main__':
    connect_to_db(app)
    app.run(debug=True)
    