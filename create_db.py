from server import app
from models import User, Product, Cart, CartItem, Order, connect_to_db, db


def create_db_command():
    """Creating and connecting database"""
    connect_to_db(app)
    
    
    with app.app_context():
        db.drop_all()
        db.create_all()
        print("Database tables created successfully.")

if __name__ == '__main__':
    create_db_command()