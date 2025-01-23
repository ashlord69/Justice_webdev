from flask import Blueprint
import os

# Set up Blueprint for tracking with its own template and static folders
tracking_bp = Blueprint(
    'tracking',
    __name__,
    template_folder='templates',  # Folder for templates
    static_folder='static',       # Folder for static files
    static_url_path='/tracking/static'  # URL path for static files
)

from . import routes
