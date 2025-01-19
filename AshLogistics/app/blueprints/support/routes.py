from flask import render_template
from . import support_bp

# About Us Page
@support_bp.route("/about")
def about():
    return render_template("about-us-page.html")  # Updated template name

# Customer Service Page
@support_bp.route("/contact")
def customer_service():
    return render_template("customer-page.html")  # Updated template name
