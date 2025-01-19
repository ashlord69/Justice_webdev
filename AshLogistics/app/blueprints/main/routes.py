from flask import render_template
from . import main_bp

# Homepage
@main_bp.route("/")
def homepage():
    return render_template("home-page.html")  # Updated template name and removed the About Us page
