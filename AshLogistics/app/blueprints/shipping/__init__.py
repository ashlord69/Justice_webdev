from flask import Blueprint

shipping_bp = Blueprint(
    'shipping',
    __name__,
    static_folder='static',  # Serve static files from this folder
    template_folder='templates'
)
