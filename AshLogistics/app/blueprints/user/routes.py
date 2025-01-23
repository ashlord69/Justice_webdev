from flask import render_template
from . import user_bp  # Import the blueprint defined above

# Login Page
@user_bp.route("/login", endpoint="login")  # Explicitly set the endpoint name
def login():
    return render_template("login-page.html")
