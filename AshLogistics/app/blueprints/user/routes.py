from flask import render_template
from . import user_bp

# Login Page
@user_bp.route("/login")
def login():
    return render_template("login-page.html")  # Updated template name
