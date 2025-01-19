from flask_pymongo import PyMongo
from app import mongo

class Quote:
    def __init__(self, customer_name, origin, destination, weight, quote_price):
        self.customer_name = customer_name
        self.origin = origin
        self.destination = destination
        self.weight = weight
        self.quote_price = quote_price

    def save(self):
        quote_data = {
            "customer_name": self.customer_name,
            "origin": self.origin,
            "destination": self.destination,
            "weight": self.weight,
            "quote_price": self.quote_price
        }
        mongo.db.quotes.insert_one(quote_data)  # More explicit dictionary for clarity

class Package:
    @staticmethod
    def find_by_tracking_number(tracking_number):
        return mongo.db.packages.find_one({"tracking_number": tracking_number})

    # Example of an instance method (optional)
    @staticmethod
    def find_by_customer_name(customer_name):
        return mongo.db.packages.find({"customer_name": customer_name})
