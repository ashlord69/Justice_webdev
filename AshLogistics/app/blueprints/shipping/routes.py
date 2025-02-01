from flask import Blueprint, jsonify, request, render_template, current_app
from flask_login import login_required, current_user
from app.models import Shipment, Quote
from datetime import datetime
from flask import redirect , url_for
import requests
from . import shipping_bp



# SHIPPING ROUTES 


shipment_model = Shipment()

@shipping_bp.route("/shipping")
def shipping():
    if not current_user.is_authenticated:
        return redirect(url_for('user.login', next=request.path))
    
    user_data = {
        'full_name': current_user.full_name,
        'email': current_user.email,
        'phone_number': current_user.phone_number
    }
    return render_template("shipping-page.html", user=user_data)



@shipping_bp.route("/countries")
def get_countries():
    """Get list of countries from REST Countries API"""
    try:
        response = requests.get('https://restcountries.com/v3.1/all')
        if response.status_code == 200:
            countries = []
            for country in response.json():
                countries.append({
                    'code': country.get('cca2', ''),
                    'name': country.get('name', {}).get('common', '')
                })
            return jsonify(sorted(countries, key=lambda x: x['name']))
        return jsonify([])
    except Exception as e:
        current_app.logger.error(f"Error fetching countries: {str(e)}")
        return jsonify([])

@shipping_bp.route("/create", methods=['POST'])
@login_required
def create_shipment():
    try:
        shipment_data = request.form.to_dict()
        shipment_id, tracking_number = shipment_model.create_shipment(
            str(current_user.id),
            shipment_data
        )
        
        if shipment_id and tracking_number:
            return jsonify({
                'success': True,
                'tracking_number': tracking_number,
                'message': 'Shipment created successfully'
            })
        return jsonify({
            'success': False,
            'message': 'Failed to create shipment'
        }), 400
    except Exception as e:
        current_app.logger.error(f"Error creating shipment: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred while creating the shipment'
        }), 500
    

@shipping_bp.route("/track/<tracking_number>")
def track_shipment(tracking_number):
    if not current_user.is_authenticated:
        return redirect(url_for('user.login', next=request.path))
    else:
        shipment = shipment_model.get_shipment_by_tracking(tracking_number)
        if shipment:
            return render_template(
                'shipping/tracking.html',
                shipment=shipment,
                current_time=datetime.utcnow()
            )
        return render_template('shipping/tracking.html', error='Shipment not found')


@shipping_bp.route('/user/update-current-user', methods=['POST'])
@login_required
def update_current_user():
    current_user.update_from_token(request.headers.get('Authorization'))
    return jsonify({'success': True})








# Quote Page
@shipping_bp.route("/quote")
def quote():
    return render_template("quote-page.html")  # Updated template name



# Add these routes to your existing routes.py file

@shipping_bp.route("/calculate-quote", methods=['POST'])
def calculate_quote():
    try:
        data = request.json
        # Add user_id only if user is logged in
        if current_user.is_authenticated:
            data['user_id'] = str(current_user.id)
        
        quote_model = Quote()
        quotes = quote_model.calculate_shipping_rates(data)
        
        if quotes:
            return jsonify(quotes)
        return jsonify({
            'success': False,
            'message': 'Failed to calculate quote'
        }), 400
    except Exception as e:
        current_app.logger.error(f"Error calculating quote: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred while calculating the quote'
        }), 500

@shipping_bp.route("/quote-history")
@login_required
def quote_history():
    quote_model = Quote()
    quotes = quote_model.get_quote_history(str(current_user.id))
    return render_template("quote-history.html", quotes=quotes)

