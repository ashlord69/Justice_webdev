document.addEventListener('DOMContentLoaded', function() {
    const quoteForm = document.getElementById('quoteForm');
    const quoteResult = document.getElementById('quoteResult');

    // Sample shipping rates (simulated database)
    const shippingRates = {
        'express': {
            baseRate: 50,
            perKg: 10,
            deliveryDays: '1-2'
        },
        'economy': {
            baseRate: 30,
            perKg: 7,
            deliveryDays: '3-5'
        },
        'standard': {
            baseRate: 20,
            perKg: 5,
            deliveryDays: '5-7'
        }
    };

    quoteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateQuote();
    });

    function calculateQuote() {
        // Get form data
        const formData = new FormData(quoteForm);
        const weight = parseFloat(formData.get('weight'));
        const length = parseFloat(formData.get('length'));
        const width = parseFloat(formData.get('width'));
        const height = parseFloat(formData.get('height'));
        const fromCountry = formData.get('fromCountry');
        const toCountry = formData.get('toCountry');
        const shippingDate = new Date(formData.get('shippingDate'));

        // Calculate volumetric weight
        const volumetricWeight = (length * width * height) / 5000;
        const chargeableWeight = Math.max(weight, volumetricWeight);

        // Calculate quotes for different service levels
        const quotes = Object.entries(shippingRates).map(([service, rates]) => {
            const basePrice = rates.baseRate;
            const weightCharge = chargeableWeight * rates.perKg;
            const totalPrice = basePrice + weightCharge;

            // Add international surcharge if applicable
            const internationalSurcharge = fromCountry !== toCountry ? totalPrice * 0.1 : 0;
            const finalPrice = totalPrice + internationalSurcharge;

            return {
                service: service,
                price: finalPrice.toFixed(2),
                deliveryDays: rates.deliveryDays,
                estimatedDelivery: calculateEstimatedDelivery(shippingDate, rates.deliveryDays)
            };
        });

        displayQuotes(quotes);
    }

    function calculateEstimatedDelivery(shippingDate, deliveryDays) {
        const [minDays, maxDays] = deliveryDays.split('-').map(Number);
        const minDate = new Date(shippingDate);
        const maxDate = new Date(shippingDate);
        
        minDate.setDate(minDate.getDate() + minDays);
        maxDate.setDate(maxDate.getDate() + maxDays);

        return {
            min: minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            max: maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };
    }

    function displayQuotes(quotes) {
        const quoteHTML = `
            <div class="card shadow-sm">
                <div class="card-body">
                    <h3 class="h4 mb-4">Available Shipping Options</h3>
                    ${quotes.map(quote => `
                        <div class="quote-option card mb-3">
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-md-4">
                                        <h4 class="h5 mb-2">${capitalizeFirstLetter(quote.service)} Shipping</h4>
                                        <p class="price mb-0">$${quote.price}</p>
                                    </div>
                                    <div class="col-md-4">
                                        <p class="delivery-time mb-0">
                                            Estimated Delivery:<br>
                                            ${quote.estimatedDelivery.min} - ${quote.estimatedDelivery.max}
                                        </p>
                                    </div>
                                    <div class="col-md-4 text-md-end">
                                        <a href="/shipping/shipping" class="btn btn-primary">Ship Now</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        quoteResult.innerHTML = quoteHTML;
        quoteResult.style.display = 'block';

        // Scroll to results
        quoteResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});