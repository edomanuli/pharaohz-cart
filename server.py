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
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql:///cart')
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
    print(form.email.data)
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
    url = "https://dummyjson.com/products?limit=100"
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
    page = request.args.get('page', 1, type=int)
    all_products = Product.query.paginate(page=page, per_page=20)
    return render_template('products.html', title='Products', products=all_products)


@app.route("/product_details/<int:product_id>", methods=['GET'])
def product_details(product_id):
    """Display product details"""
    product = Product.query.get(product_id)
    
    if product:
        return jsonify({
            'id': product.id,
            'title': product.title,
            'description': product.description,
            'price': product.price,
            'stock_quantity': product.stock_quantity,
            'thumbnail': product.thumbnail
        })
    return jsonify({'error': 'Product not found'}), 404
           
            

@app.route('/add-to-cart', methods=["POST"])
def add_to_cart():
    """Add to Cart"""
    if not current_user.is_authenticated:
        return jsonify({"message": "Please log in to add items to cart."}), 403
    
    product_id = request.json.get('product_id')
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({"message": "Product not found."}), 404
    
    # Check if user already has a cart, if not, create one
    user_cart = Cart.query.filter_by(user_id=current_user.user_id).first()
    if not user_cart:
        user_cart = Cart(user_id=current_user.user_id)
        db.session.add(user_cart)
        
    # Check if product is already in the cart
    cart_item = CartItem.query.filter_by(cart_id=user_cart.cart_id, product_id=product_id).first()
    if cart_item:
        # Increase quantity if the product is already in the cart
        cart_item.quantity += 1
    else:
        # Add a new item to the cart
        new_cart_item = CartItem(cart_id=user_cart.cart_id, product_id=product_id, quantity=1)
        db.session.add(new_cart_item)
        
    db.session.commit()
    
    return jsonify({"message": "Product added to cart."})

  
@app.route('/view_cart')
def view_cart():
    """render cart page"""
    if not current_user.is_authenticated:
        return jsonify({"message": " Please log in to view cart."}), 403
    
    # Fetch user's cart items
    user_cart = Cart.query.filter_by(user_id=current_user.user_id).first()
    if not user_cart:
        return jsonify({"message": "Your cart is empty.", "items": []})
    
    cart_items = CartItem.query.filter_by(cart_id=user_cart.cart_id).all()
    # Convert cart items to a list of dictionaries to return as JSON
    items_list = [item.to_dict() for item in cart_items]
    
    return jsonify(items_list)


@app.route('/cart')
def cart_page():
    """Render cart page template."""
    if not current_user.is_authenticated:
        return "Please log in to view cart.", 403

    return render_template('cart.html')

@app.route('/delete_items', methods=["POST"])
@login_required
def delete_items():
    """Route to delete selected items"""
    if not current_user.is_authenticated:
        return jsonify({"message": "Please log in to remove items."}), 403
    
    product_ids = request.json.get('product_ids', [None])
    
    if isinstance(product_ids, int):
        product_ids = [product_ids]
        
    if not product_ids or not isinstance(product_ids, list):
        return jsonify({"message": "No items selected for deletion."}), 400
    
    # fetch the user's cart
    user_cart = Cart.query.filter_by(user_id=current_user.user_id).first()
    
    # Delete the selected cart items
    CartItem.query.filter(CartItem.cart_id == user_cart.cart_id, CartItem.product_id.in_(product_ids)).delete(synchronize_session=False)
    
    db.session.commit()
    
    return jsonify({"message": "Items deleted successfully."})


    
if __name__ == '__main__':
    connect_to_db(app)
    app.run(debug=True)
    