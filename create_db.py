from server import app
from models import User, Product, Cart, CartItem, Order, connect_to_db, db

# anuli = User(first_name='Anuli', last_name='Edom', email='edomanuli@pharoahz.com', username='edomanuli', password='password')
# frank = User(first_name='Frank', last_name='Oz', email='frank@pharoahz.com', username='frank91', password='password')

# db.session.add(anuli)
# db.session.add(frank)
# db.session.commit()

def create_db_command():
    """Creating and connecting database"""
    connect_to_db(app)
    
    
    with app.app_context():
        db.drop_all()
        db.create_all()
        print("Database tables created successfully.")

if __name__ == '__main__':
    create_db_command()