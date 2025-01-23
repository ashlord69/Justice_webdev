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
            "destination": "Los Angeles, CA",
            "pickup_date": "2025-01-10",
            "estimated_arrival": "2025-01-25"
        },
        "789012": {
            "tracking_number": "789012",
            "status": "Delivered",
            "origin": "Miami, FL",
            "destination": "Dallas, TX",
            "pickup_date": "2025-01-12",
            "estimated_arrival": "2025-01-20"
        },
        "345678": {
            "tracking_number": "345678",
            "status": "Waiting for Custom Clearance",
            "origin": "Chicago, IL",
            "destination": "San Francisco, CA",
            "pickup_date": "2025-01-15",
            "estimated_arrival": "2025-01-28"
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
            # Generate tracking status dynamically
            package_status = {
                "tracking_code": package["tracking_number"],
                "status": package["status"],
                "origin": package["origin"],
                "destination": package["destination"],
                "pickup_date": package["pickup_date"],
                "estimated_arrival": package["estimated_arrival"]
            }
            return render_template("tracking-page.html", package_status=package_status)
        else:
            return render_template("tracking-page.html", error="Package not found.")
    return render_template("tracking-page.html", error="Please enter a tracking number.")
