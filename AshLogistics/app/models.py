from app.extensions import mongo, bcrypt
from datetime import datetime, timedelta
from bson import ObjectId
import string, random

class User:
    def __init__(self, email, full_name, phone_number, password=None):
        self.email = email
        self.full_name = full_name
        self.phone_number = phone_number
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8') if password else None
        self.is_verified = False
        self.verification_code = None
        self.verification_code_expires = None
        self.created_at = datetime.utcnow()
        self.failed_login_attempts = 0
        self.last_login_attempt = None

    @staticmethod
    def create_user(email, full_name, phone_number, password):
        """Create a new user with hashed password and default verification status."""
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        user = {
            'email': email,
            'full_name': full_name,
            'phone_number': phone_number,
            'password': hashed_password,
            'created_at': datetime.utcnow(),
            'is_verified': False,
            'verification_code': None,
            'verification_code_expires': None,
            'failed_login_attempts': 0,
            'last_login_attempt': None
        }
        try:
            # Check if user already exists
            if mongo.db.users.find_one({'email': email}):
                return None, "Email already registered"
            
            result = mongo.db.users.insert_one(user)
            return str(result.inserted_id), None
        except Exception as e:
            print(f"Error creating user: {e}")
            return None, "Database error occurred"

    @staticmethod
    def get_user_by_email(email):
        """Retrieve a user by their email."""
        try:
            user = mongo.db.users.find_one({'email': email})
            if user:
                # Convert ObjectId to string for JSON serialization
                user['_id'] = str(user['_id'])
            return user
        except Exception as e:
            print(f"Error fetching user by email: {e}")
            return None

    @staticmethod
    def get_user_by_id(user_id):
        """Retrieve a user by their ID."""
        try:
            user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
            if user:
                # Convert ObjectId to string for JSON serialization
                user['_id'] = str(user['_id'])
            return user
        except Exception as e:
            print(f"Error fetching user by ID: {e}")
            return None

    @staticmethod
    def update_verification_code(email, code, expiry_minutes=10):
        """Update verification code and its expiry."""
        expiry = datetime.utcnow() + timedelta(minutes=expiry_minutes)
        try:
            result = mongo.db.users.update_one(
                {'email': email},
                {'$set': {
                    'verification_code': code,
                    'verification_code_expires': expiry
                }}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating verification code: {e}")
            return False

    @staticmethod
    def verify_user(email, code):
        """Verify user with provided code."""
        try:
            user = mongo.db.users.find_one({
                'email': email,
                'verification_code': code,
                'verification_code_expires': {'$gt': datetime.utcnow()}
            })
            
            if not user:
                return False, "Invalid or expired verification code"
            
            result = mongo.db.users.update_one(
                {'email': email},
                {'$set': {
                    'is_verified': True,
                    'verification_code': None,
                    'verification_code_expires': None
                }}
            )
            return result.modified_count > 0, None
        except Exception as e:
            print(f"Error verifying user: {e}")
            return False, "Database error occurred"

    @staticmethod
    def delete_user(email):
        """Delete a user from the database."""
        try:
            result = mongo.db.users.delete_one({'email': email})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting user: {e}")
            return False

    @staticmethod
    def check_password(stored_password, provided_password):
        """Check if the provided password matches the stored hashed password."""
        try:
            return bcrypt.check_password_hash(stored_password, provided_password)
        except Exception as e:
            print(f"Error checking password: {e}")
            return False

    @staticmethod
    def update_password(email, new_password):
        """Update user's password."""
        try:
            hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
            result = mongo.db.users.update_one(
                {'email': email},
                {'$set': {
                    'password': hashed_password,
                    'failed_login_attempts': 0,
                    'last_login_attempt': None
                }}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating password: {e}")
            return False

    @staticmethod
    def increment_failed_login(email):
        """Increment failed login attempts counter."""
        try:
            result = mongo.db.users.update_one(
                {'email': email},
                {
                    '$inc': {'failed_login_attempts': 1},
                    '$set': {'last_login_attempt': datetime.utcnow()}
                }
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error incrementing failed login attempts: {e}")
            return False

    @staticmethod
    def reset_failed_login(email):
        """Reset failed login attempts counter."""
        try:
            result = mongo.db.users.update_one(
                {'email': email},
                {
                    '$set': {
                        'failed_login_attempts': 0,
                        'last_login_attempt': None
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error resetting failed login attempts: {e}")
            return False

    @staticmethod
    def is_account_locked(email):
        """Check if account is locked due to too many failed attempts."""
        try:
            user = mongo.db.users.find_one({'email': email})
            if not user:
                return False
            
            if user.get('failed_login_attempts', 0) >= 5:
                last_attempt = user.get('last_login_attempt')
                if last_attempt:
                    lockout_period = datetime.utcnow() - last_attempt
                    if lockout_period < timedelta(minutes=15):
                        return True
                    # Reset counter if lockout period has passed
                    User.reset_failed_login(email)
            return False
        except Exception as e:
            print(f"Error checking account lock status: {e}")
            return False

    @staticmethod
    def get_user_profile(email):
        """Get user profile information."""
        try:
            user = mongo.db.users.find_one(
                {'email': email},
                {'password': 0}  # Exclude password from the result
            )
            if user:
                user['_id'] = str(user['_id'])
            return user
        except Exception as e:
            print(f"Error fetching user profile: {e}")
            return None







## Shipment models #




class Shipment:
    def __init__(self):
        self.collection = mongo.db.shipments

    def generate_tracking_number(self):
        """Generate a unique tracking number."""
        timestamp = datetime.utcnow().strftime('%Y%m%d')
        random_chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        tracking_number = f'ASH{timestamp}{random_chars}'
        return tracking_number

    def create_shipment(self, user_id, shipment_data):
        """Create a new shipment record."""
        try:
            tracking_number = self.generate_tracking_number()
            shipment = {
                'user_id': ObjectId(user_id),
                'tracking_number': tracking_number,
                'status': 'pending',
                'created_at': datetime.utcnow(),
                'sender': {
                    'name': shipment_data.get('senderName'),
                    'email': shipment_data.get('senderEmail'),
                    'phone': shipment_data.get('senderPhone'),
                    'company': shipment_data.get('senderCompany'),
                    'address': shipment_data.get('senderAddress'),
                    'city': shipment_data.get('senderCity'),
                    'country': shipment_data.get('senderCountry'),
                    'postal_code': shipment_data.get('senderPostalCode')
                },
                'recipient': {
                    'name': shipment_data.get('recipientName'),
                    'email': shipment_data.get('recipientEmail'),
                    'phone': shipment_data.get('recipientPhone'),
                    'company': shipment_data.get('recipientCompany'),
                    'address': shipment_data.get('recipientAddress'),
                    'city': shipment_data.get('recipientCity'),
                    'country': shipment_data.get('recipientCountry'),
                    'postal_code': shipment_data.get('recipientPostalCode')
                },
                'package': {
                    'service_type': shipment_data.get('serviceType'),
                    'package_type': shipment_data.get('packageType'),
                    'weight': float(shipment_data.get('weight')),
                    'dimensions': {
                        'length': float(shipment_data.get('length')),
                        'width': float(shipment_data.get('width')),
                        'height': float(shipment_data.get('height'))
                    },
                    'declared_value': float(shipment_data.get('declaredValue')),
                    'contents': shipment_data.get('contents'),
                    'insurance': shipment_data.get('insurance') == 'true',
                    'signature_required': shipment_data.get('signature') == 'true'
                },
                'tracking_history': [{
                    'status': 'Order Created',
                    'location': shipment_data.get('senderCity'),
                    'timestamp': datetime.utcnow(),
                    'description': 'Shipment has been created and is pending pickup'
                }],
                'payment': {
                    'amount': float(shipment_data.get('totalCost', 0)),
                    'status': 'paid',
                    'payment_date': datetime.utcnow()
                }
            }
            
            result = self.collection.insert_one(shipment)
            return str(result.inserted_id), tracking_number
        except Exception as e:
            print(f"Error creating shipment: {e}")
            return None, None

    def get_user_shipments(self, user_id):
        """Get all shipments for a specific user."""
        try:
            shipments = list(self.collection.find({'user_id': ObjectId(user_id)}).sort('created_at', -1))
            for shipment in shipments:
                shipment['_id'] = str(shipment['_id'])
            return shipments
        except Exception as e:
            print(f"Error fetching user shipments: {e}")
            return []

    def get_shipment_by_tracking(self, tracking_number):
        """Get shipment details by tracking number."""
        try:
            shipment = self.collection.find_one({'tracking_number': tracking_number})
            if shipment:
                shipment['_id'] = str(shipment['_id'])
            return shipment
        except Exception as e:
            print(f"Error fetching shipment: {e}")
            return None

    def update_tracking_status(self, tracking_number, status, location, description):
        """Update the tracking status of a shipment."""
        try:
            tracking_update = {
                'status': status,
                'location': location,
                'timestamp': datetime.utcnow(),
                'description': description
            }
            
            result = self.collection.update_one(
                {'tracking_number': tracking_number},
                {
                    '$push': {'tracking_history': tracking_update},
                    '$set': {'status': status}
                }
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating tracking status: {e}")
            return False
        












# Quote models 

class Quote:
    def __init__(self):
        self.collection = mongo.db.quotes

    def calculate_shipping_rates(self, data):
        """Calculate shipping rates based on package details and locations"""
        try:
            # Get weight and dimensions
            weight = float(data.get('weight', 0))
            length = float(data.get('length', 0))
            width = float(data.get('width', 0))
            height = float(data.get('height', 0))
            from_country = data.get('fromCountry')
            to_country = data.get('toCountry')
            shipping_date = datetime.strptime(data.get('shippingDate'), '%Y-%m-%d')

            # Calculate volumetric weight
            volumetric_weight = (length * width * height) / 5000
            chargeable_weight = max(weight, volumetric_weight)

            # Get base rates from database
            base_rates = self.collection.find_one({'type': 'base_rates'})
            if not base_rates:
                # Insert default rates if not exists
                base_rates = {
                    'type': 'base_rates',
                    'express': {'base': 50, 'per_kg': 10, 'days': '1-2'},
                    'economy': {'base': 30, 'per_kg': 7, 'days': '3-5'},
                    'standard': {'base': 20, 'per_kg': 5, 'days': '5-7'}
                }
                self.collection.insert_one(base_rates)

            quotes = []
            services = ['express', 'economy', 'standard']
            for service in services:
                rates = base_rates.get(service, {})
                if rates:  # Only process if we have rates for this service
                    base_price = rates.get('base', 0)
                    per_kg = rates.get('per_kg', 0)
                    weight_charge = chargeable_weight * per_kg
                    total_price = base_price + weight_charge

                    # Apply international surcharge
                    if from_country != to_country:
                        total_price *= 1.1  # 10% international surcharge

                    # Calculate delivery dates
                    delivery_days = rates.get('days', '1-2')  # Default to 1-2 days if not specified
                    min_days, max_days = map(int, delivery_days.split('-'))
                    min_date = shipping_date + timedelta(days=min_days)
                    max_date = shipping_date + timedelta(days=max_days)

                    quotes.append({
                        'service': service,
                        'price': round(total_price, 2),
                        'delivery_days': delivery_days,
                        'estimated_delivery': {
                            'min': min_date.strftime('%b %d'),
                            'max': max_date.strftime('%b %d')
                        }
                    })

            # Save quote to database
            quote_record = {
                'package_details': {
                    'weight': weight,
                    'dimensions': {
                        'length': length,
                        'width': width,
                        'height': height
                    },
                    'from_country': from_country,
                    'to_country': to_country,
                    'shipping_date': shipping_date
                },
                'quotes': quotes,
                'created_at': datetime.utcnow()
            }
            if 'user_id' in data:
                quote_record['user_id'] = data['user_id']
            self.collection.insert_one(quote_record)

            return quotes
        except Exception as e:
            print(f"Error calculating shipping rates: {e}")
            return None


    def get_quote_history(self, user_id):
        """Get quote history for a user"""
        try:
            quotes = list(self.collection.find(
                {'user_id': user_id},
                {'_id': 0}
            ).sort('created_at', -1))
            return quotes
        except Exception as e:
            print(f"Error fetching quote history: {e}")
            return []
        








#DASHBOARD MODELS

# Update the get_dashboard_data method in the Quote class
def get_dashboard_data(self):
    """Get all quotes data for dashboard display"""
    try:
        # Find all quotes except base rates, sorted by creation date
        pipeline = [
            {'$match': {'type': {'$ne': 'base_rates'}}},
            {'$sort': {'created_at': -1}}
        ]
        
        quotes = list(self.collection.find(pipeline))
        
        # Process quotes for display
        processed_quotes = []
        for quote in quotes:
            # Convert ObjectId to string
            quote['_id'] = str(quote['_id'])
            
            # Format dates
            if 'created_at' in quote:
                quote['created_at'] = quote['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            
            if 'package_details' in quote and 'shipping_date' in quote['package_details']:
                quote['package_details']['shipping_date'] = quote['package_details']['shipping_date'].strftime('%Y-%m-%d')
            
            processed_quotes.append(quote)
        
        # Calculate statistics
        total_quotes = len(processed_quotes)
        international_quotes = sum(1 for q in processed_quotes if 
            q.get('package_details', {}).get('from_country') != 
            q.get('package_details', {}).get('to_country'))
        domestic_quotes = total_quotes - international_quotes
        
        return {
            'quotes': processed_quotes,
            'stats': {
                'total_quotes': total_quotes,
                'international_quotes': international_quotes,
                'domestic_quotes': domestic_quotes
            }
        }
    except Exception as e:
        print(f"Error fetching dashboard data: {e}")
        return {'quotes': [], 'stats': {'total_quotes': 0, 'international_quotes': 0, 'domestic_quotes': 0}}