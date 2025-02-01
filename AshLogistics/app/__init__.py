from flask import Flask
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from dotenv import load_dotenv
import os
import dotenv
from .extensions import init_extensions
from flask_login import LoginManager

login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    from app.models import User
    user = User.query.get(int(user_id))
    if user:
        return user
    else:
        return None


def create_app():
    """Application Factory Pattern for creating a Flask app instance."""
    dotenv.load_dotenv('.env')
    app = Flask(__name__, static_folder='static')
    from .models import User
    # Set MONGO_URI environment variable
    app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/ash_logistics')
    init_extensions(app)

    # Load environment variables
    load_dotenv()


    # Initialize extensions
    jwt = JWTManager()
    mail = Mail()
    

    # Initialize extensions with the app
    jwt.init_app(app)
    mail.init_app(app)
    login_manager.init_app(app)







    # App configurations
    app.config.from_mapping(
        SECRET_KEY=os.urandom(16),  # Generate a random secret key
        MONGO_URI=os.getenv('MONGO_URI'),
        JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY'),
        MAIL_SERVER=os.getenv('MAIL_SERVER'),
        MAIL_PORT=int(os.getenv('MAIL_PORT', 587)),
        MAIL_USE_TLS=os.getenv('MAIL_USE_TLS', 'True').lower() == 'True',
        MAIL_USERNAME=os.getenv('MAIL_USERNAME'),
        MAIL_PASSWORD=os.getenv('MAIL_PASSWORD')
    )



    # Import Blueprints
    from app.blueprints.main.routes import main_bp
    from app.blueprints.user.routes import user_bp
    from app.blueprints.shipping.routes import shipping_bp
    from app.blueprints.admin.routes import admin_bp
    from app.blueprints.tracking.routes import tracking_bp
    from app.blueprints.support.routes import support_bp





    
    # Register Blueprints
    app.register_blueprint(main_bp, url_prefix='/')
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(shipping_bp, url_prefix='/shipping')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(tracking_bp, url_prefix='/tracking')
    app.register_blueprint(support_bp, url_prefix='/support')
    

    return app
