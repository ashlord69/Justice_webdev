from flask import Blueprint

user_bp = Blueprint(
    'user', 
    __name__, 
    static_folder='static',  # Define where the static folder is for this blueprint
    template_folder='templates'  # Templates folder for this blueprint
)
