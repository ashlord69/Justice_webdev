from flask import Blueprint
import os

# Set up Blueprint for tracking with its own template folder
tracking_bp = Blueprint('tracking', __name__, template_folder='templates')  # Adjusted path for template folder

from . import routes
