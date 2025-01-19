from flask import render_template
from . import admin_bp

# Terms Page
@admin_bp.route("/terms")
def terms():
    return render_template("terms-and-conditions.html")  # Corrected template name

# Add more routes below as needed, e.g., if you have other admin routes
# Example of another route using 'base.html'
@admin_bp.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")  # Make sure 'dashboard.html' is under 'templates'
