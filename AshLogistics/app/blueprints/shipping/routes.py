from flask import render_template
from . import shipping_bp

# Quote Page
@shipping_bp.route("/quote")
def quote():
    return render_template("quote-page.html")  # Updated template name

# Shipping Page
@shipping_bp.route("/shipping")
def shipping():
    return render_template("shipping-page.html")  # Updated template name
