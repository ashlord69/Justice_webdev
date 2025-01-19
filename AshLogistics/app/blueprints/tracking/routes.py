from flask import render_template, request
from . import tracking_bp

# Simulated data for demonstration purposes
def find_package_by_tracking_number(tracking_number):
    # Dummy data for example; replace with real database lookup
    dummy_data = {
        "123456": {
            "tracking_number": "123456",
            "status": "In Transit",
            "origin": "New York, NY",
            "destination": "Los Angeles, CA"
        },
        "789012": {
            "tracking_number": "789012",
            "status": "Delivered",
            "origin": "Miami, FL",
            "destination": "Dallas, TX"
        }
    }
    return dummy_data.get(tracking_number)

# Tracking Page
@tracking_bp.route("/track", methods=["GET"])
def track():
    tracking_number = request.args.get("tracking_number")
    if tracking_number:
        package = find_package_by_tracking_number(tracking_number)
        if package:
            return render_template("tracking-page.html", package=package)
        else:
            return render_template("tracking-page.html", error="Package not found.")
    return render_template("tracking-page.html", error="Please enter a tracking number.")
