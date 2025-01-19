from flask import Blueprint
import os

# Set up Blueprint for shipping with its own template folder
shipping_bp = Blueprint('shipping', __name__, template_folder='templates')  # Adjusted path for template folder

from . import routes
