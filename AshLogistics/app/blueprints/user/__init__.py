from flask import Blueprint
import os

# Set up Blueprint for user with its own template folder
user_bp = Blueprint('user', __name__, template_folder='templates')  # Adjusted path for template folder

from . import routes
