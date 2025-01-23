from flask import Flask
from flask_pymongo import PyMongo

# Import Blueprints
from app.blueprints.main.routes import main_bp
from app.blueprints.user.routes import user_bp
from app.blueprints.shipping.routes import shipping_bp
from app.blueprints.admin.routes import admin_bp
from app.blueprints.tracking.routes import tracking_bp
from app.blueprints.support.routes import support_bp

# Initialize MongoDB
mongo = PyMongo()

def create_app():
    """Application Factory Pattern for creating a Flask app instance."""
    app = Flask(__name__, static_folder='static')

    # Flask Configuration
    app.config["MONGO_URI"] = "mongodb://localhost:27017/ash_logistics"
    app.config['SECRET_KEY'] = 'your_secret_key'  # Replace with a secure key in production

    # Initialize MongoDB
    mongo.init_app(app)

    # Register Blueprints
    app.register_blueprint(main_bp, url_prefix='/')
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(shipping_bp, url_prefix='/shipping')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(tracking_bp, url_prefix='/tracking')
    app.register_blueprint(support_bp, url_prefix='/support')


    # Print template search paths for debugging
    print("Template Search Paths:")
    print(app.jinja_loader.searchpath)



    return app
