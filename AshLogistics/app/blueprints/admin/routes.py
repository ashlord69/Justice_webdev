from flask import render_template
from . import admin_bp

# Terms Page - This template will extend from 'base.html'
@admin_bp.route("/terms")
def terms():
    return render_template("terms-and-conditions.html")  # Will extend 'base.html'

#Cookies and Policy Page
@admin_bp.route("/policies")
def policies():
    return render_template("policies.html")  # Will extend 'base.html'
