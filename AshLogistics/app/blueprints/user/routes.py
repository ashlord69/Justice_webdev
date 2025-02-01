from flask import jsonify, request, render_template, url_for, redirect
from flask_login import login_required, current_user, login_user, logout_user
from app.blueprints.user import user_bp
from app.models import User, Quote
from app.extensions import mongo, bcrypt
from bson import ObjectId
import jwt
import datetime
import os
from functools import wraps

# JWT token verification decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, os.getenv('JWT_SECRET_KEY'), algorithms=['HS256'])
            current_user = mongo.db.users.find_one({'_id': ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({'error': 'Invalid token'}), 401
        except:
            return jsonify({'error': 'Invalid token'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated




#login 










@user_bp.route('/login', methods=['GET', 'POST'])
def login():
    next_url = request.args.get('next', '')
    if request.method == 'POST':
        data = request.get_json()
        user = mongo.db.users.find_one({'email': data['email']})
        
        if not user or not bcrypt.check_password_hash(user['password'], data['password']):
            return jsonify({"error": "Invalid email or password"}), 401
        
        token = jwt.encode(
            {
                'user_id': str(user['_id']),
                'email': user['email'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1 if not data.get('remember_me') else 30)
            },
            os.getenv('JWT_SECRET_KEY'),
            algorithm='HS256'
        )
        
        next_url = request.args.get('next')
        if not next_url or next_url.startswith('/login'):
            next_url = url_for('user.dashboard')
        
        return jsonify({
            "token": token,
            "user": {
                "email": user['email'],
                "full_name": user['full_name']
            },
            "redirect_url": next_url
        }), 200

    return render_template('login-page.html', next=next_url)

@user_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if mongo.db.users.find_one({'email': data['email']}):
        return jsonify({"error": "Email already registered"}), 400

    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = {
        'email': data['email'],
        'full_name': data['full_name'],
        'password': hashed_password,
        'created_at': datetime.datetime.utcnow(),
        'last_login': None,
        'phone_number': data.get('phone_number', ''),
        'address': data.get('address', ''),
        'company': data.get('company', '')
    }
    
    try:
        result = mongo.db.users.insert_one(user)
        if result.inserted_id:
            return jsonify({"message": "Registration successful"}), 201
        else:
            return jsonify({"error": "Registration failed"}), 500
    except Exception as e:
        return jsonify({"error": "Registration failed"}), 500

@user_bp.route('/logout')
def logout():
    return redirect(url_for('user.login'))








#DASHBOARD ROUTES 




# Dashboard routes

@user_bp.route('/dashboard')
def dashboard():
    """Render the dashboard page"""
    return render_template('dashboard.html')


@user_bp.route('/api/quotes')
def get_quotes():
    """API endpoint to get all quotes"""
    try:
        quote = Quote()
        data = quote.get_dashboard_data()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data available",
                "stats": {'total_quotes': 0, 'international_quotes': 0, 'domestic_quotes': 0},
                "quotes": []
            }), 200
            
        return jsonify({
            "success": True,
            "stats": data['stats'],
            "quotes": data['quotes']
        }), 200
        
    except Exception as e:
        print(f"Error in get_quotes route: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "stats": {'total_quotes': 0, 'international_quotes': 0, 'domestic_quotes': 0},
            "quotes": []
        }), 500

# @user_bp.route('/api/user/profile', methods=['GET'])
# @token_required
# def get_user_profile(current_user):
#     current_user['_id'] = str(current_user['_id'])
#     if 'password' in current_user:
#         del current_user['password']
#     return jsonify(current_user), 200

# @user_bp.route('/api/user/change-password', methods=['POST'])
# @token_required
# def change_password(current_user):
#     try:
#         data = request.get_json()
#         current_password = data.get('current_password')
#         new_password = data.get('new_password')
        
#         if not current_password or not new_password:
#             return jsonify({'error': 'Both current and new password are required'}), 400
            
#         user = mongo.db.users.find_one({'_id': current_user['_id']})
#         if not bcrypt.check_password_hash(user['password'], current_password):
#             return jsonify({'error': 'Current password is incorrect'}), 401
        
#         hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        
#         mongo.db.users.update_one(
#             {'_id': current_user['_id']},
#             {'$set': {'password': hashed_password}}
#         )
        
#         return jsonify({'message': 'Password updated successfully'}), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500