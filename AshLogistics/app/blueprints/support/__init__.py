from flask import Blueprint
import os

# Set up Blueprint for support with its own template folder
support_bp = Blueprint('support', __name__, template_folder='templates')  # Adjusted path for template folder

from . import routes
