"""Create a database model"""
from datetime import datetime
from server import db

class Users(db.Model):
    """Create users table to hold data"""
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(16), unique=False, nullable=False)
    cart = db.relationship('Carts', backref='user', lazy='dynamic')
    orders = db.relationship('Orders', backref='user', lazy='dynamic')
    
    def __repr__(self):
        return f"<User(user_id={self.user_id}, username={self.username}, email={self.email})>"
    
class Products(db.Model):
    """create products table"""
    product_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False, unique=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    stock_quantity = db.Column(db.Integer)
    cart_items = db.relationship('CartItems', back_populates='product')
    
    def __repr__(self):
        return f"<Product(product_id={self.product_id}, title={self.title}, price={self.price})>"
    
class Carts(db.Model):
    """Cart table to hold product collection"""
    cart_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    created_at = db.Column(db.DateTime, default=func.now)
    user = db.relationship('Users', back_populates='cart')
    cart_items = db.relationship('CartItems', back_populates='cart')
    
    def __repr__(self):
        return f"<Cart(cart_id={self.cart_id}, user_id={self.user_id}, created_at={self.created_at})>"
    
class CartItems(db.Model):
    """Cart Items table to hold cart item info"""
    item_id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.cart_id'))
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id'))
    quantity = db.Column(db.Integer)
    cart = db.relationship('Carts', back_populates='cart_items')
    product = db.relationship('Products', back_populates='cart_items')
    
    def __repr__(self):
        return f"<CartItem(item_id={self.item_id}, cart_id={self.cart_id}, product_id={self.product_id}, quantity={self.quantity})>"
    
class Orders(db.Model):
    order_id = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    total_amount = db.Column(db.Float)
    user = db.relationship('Users', back_populates='orders')
    
    def __repr__(self):
        return f"<Order(order_id={self.order_id}, user_id={self.user_id}, order_date={self.order_date}, total_amount={self.total_amount})>"
