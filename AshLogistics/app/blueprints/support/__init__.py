from flask import Blueprint

# Set up Blueprint for support with its own template and static folder
support_bp = Blueprint(
    'support',
    __name__,
    template_folder='templates',
    static_folder='static'  # Specify the static folder for this blueprint
)

from . import routes
