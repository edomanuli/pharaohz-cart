"""Create a database model"""
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin
import psycopg2

db = SQLAlchemy()


class User(db.Model, UserMixin):
    """Create users table to hold data"""
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    first_name = db.Column(db.String(20), unique=False, nullable=False)
    last_name = db.Column(db.String(20), unique=False, nullable=False)
    username = db.Column(db.String(120), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    image_file = db.Column(db.String(256), nullable=False, default='default.jpg')
    password = db.Column(db.String(256), unique=False, nullable=False)
    cart = db.relationship('Cart', backref='user_cart', lazy='dynamic', cascade="all, delete-orphan")
    order = db.relationship('Order', back_populates='user', lazy='dynamic', cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(user_id={self.user_id}, first_name={self.first_name}, last_name={self.last_name}, username={self.username}, email={self.email}, password={self.password})>"
    
    def get_id(self):
        return str(self.user_id)  # Assuming the user's identifier is stored as an integer

    
    
class Product(db.Model):
    """create products table"""
    id = db.Column(db.Integer, primary_key=True, nullable=False, unique=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    stock_quantity = db.Column(db.Integer)
    thumbnail = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100))
    cart_items = db.relationship('CartItem', back_populates='product', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Product(product_id={self.id}, title={self.title}, price={self.price})>"
    
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'price': self.price,
            'stock_quantity': self.stock_quantity,
            'thumbnail': self.thumbnail,
            'category': self.category
        }
    
class Cart(db.Model):
    """Cart table to hold product collection"""
    cart_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    cart_items = db.relationship('CartItem', back_populates='cart', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Cart(cart_id={self.cart_id}, user_id={self.user_id}, created_at={self.created_at})>"
    
class CartItem(db.Model):
    """Cart Items table to hold cart item info"""
    item_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('cart.cart_id'))
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'))
    quantity = db.Column(db.Integer)
    
    cart = db.relationship('Cart', back_populates='cart_items', lazy=True)
    product = db.relationship('Product', back_populates='cart_items', lazy=True)
    
    def __repr__(self):
        return f"<CartItem(item_id={self.item_id}, cart_id={self.cart_id}, product_id={self.product_id}, quantity={self.quantity})>"
    
    def to_dict(self):
        return {
            "id": self.item_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "product": {
                "title": self.product.title,
                "price": self.product.price,
                "thumbnail": self.product.thumbnail
            }
        }
    
class Order(db.Model):
    """Orders table"""
    order_id = db.Column(db.Integer, primary_key=True, unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    total_amount = db.Column(db.Float)
    user = db.relationship('User', back_populates='order', lazy=True)
    
    def __repr__(self):
        return f"<Order(order_id={self.order_id}, user_id={self.user_id}, order_date={self.order_date}, total_amount={self.total_amount})>"


def connect_to_db(app):
    """Creating the postgres database"""
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///cart'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ECHO'] = True

    db.app = app
    db.init_app(app)

    print('Connected to database!')
    
if __name__ == '__main__':
    from server import app

    connect_to_db(app)