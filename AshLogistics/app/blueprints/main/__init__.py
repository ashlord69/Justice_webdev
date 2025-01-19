from flask import Blueprint
import os

# Set up Blueprint for main with its own template and static folder
main_bp = Blueprint(
    'main', __name__,
    template_folder='templates',    # Adjusted path for template folder
    static_folder='static'          # Define the path to the static folder within the main blueprint
)

from . import routes
