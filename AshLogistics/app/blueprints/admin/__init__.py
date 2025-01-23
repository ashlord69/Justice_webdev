from flask import Blueprint

# Set up Blueprint for admin with its own template and static folder
admin_bp = Blueprint('admin', __name__, 
                     template_folder='templates', 
                     static_folder='static')

from . import routes  # Import routes
