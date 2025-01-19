from flask import Flask
from flask_pymongo import PyMongo

# Import Blueprints (adjusted for the updated structure)
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
    app = Flask(__name__)

    # Flask Configuration
    app.config["MONGO_URI"] = "mongodb://localhost:27017/ash_logistics"
    app.config['SECRET_KEY'] = 'your_secret_key'  # Replace with a secure key in production

    # Initialize MongoDB
    mongo.init_app(app)
    app.extensions['mongo'] = mongo

    # Register Blueprints
    app.register_blueprint(main_bp, url_prefix='/', static_folder='blueprints/main/static')  # Explicitly set the static folder
    app.register_blueprint(user_bp, url_prefix='/user', static_folder='blueprints/user/static')
    app.register_blueprint(shipping_bp, url_prefix='/shipping', static_folder='blueprints/shipping/static')
    app.register_blueprint(admin_bp, url_prefix='/admin', static_folder='blueprints/admin/static')
    app.register_blueprint(tracking_bp, url_prefix='/tracking', static_folder='blueprints/tracking/static')
    app.register_blueprint(support_bp, url_prefix='/support', static_folder='blueprints/support/static')

    return app
