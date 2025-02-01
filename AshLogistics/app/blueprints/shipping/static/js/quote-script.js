document.addEventListener('DOMContentLoaded', function() {
    const quoteForm = document.getElementById('quoteForm');
    const quoteResult = document.getElementById('quoteResult');

    quoteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateQuote();
    });

    async function calculateQuote() {
        const formData = new FormData(quoteForm);
        const data = {
            weight: parseFloat(formData.get('weight')),
            length: parseFloat(formData.get('length')),
            width: parseFloat(formData.get('width')),
            height: parseFloat(formData.get('height')),
            fromCountry: formData.get('fromCountry'),
            toCountry: formData.get('toCountry'),
            shippingDate: formData.get('shippingDate')
        };

        try {
            const response = await fetch('/shipping/calculate-quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to calculate quote');
            }

            const quotes = await response.json();
            displayQuotes(quotes);
        } catch (error) {
            console.error('Error:', error);
            quoteResult.innerHTML = `
                <div class="alert alert-danger">
                    <p>An error occurred while calculating the quote. Please try again.</p>
                    <p>If the problem persists, please contact customer support.</p>
                </div>
            `;
            quoteResult.style.display = 'block';
        }
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
                                            ${quote.estimated_delivery.min} - ${quote.estimated_delivery.max}
                                        </p>
                                    </div>
                                    <div class="col-md-4 text-md-end">
                                        <button onclick="printQuote(${JSON.stringify(quote)})" class="btn btn-secondary me-2">
                                            <i class="fas fa-print me-1"></i> Print Quote
                                        </button>
                                        <a href="/shipping/shipping" class="btn btn-primary">
                                            <i class="fas fa-box me-1"></i> Ship Now
                                        </a>
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
        quoteResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    window.printQuote = function(quote) {
        const formData = new FormData(quoteForm);
        const printWindow = window.open('', '_blank');
        const today = new Date().toLocaleDateString();
        const quoteNumber = generateQuoteNumber();
        
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Shipping Quote #${quoteNumber}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 40px;
                        max-width: 800px;
                        margin: 0 auto;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #eee;
                    }
                    .quote-number {
                        font-size: 14px;
                        color: #666;
                        margin-top: 10px;
                    }
                    .quote-details {
                        margin: 20px 0;
                    }
                    .price {
                        font-size: 24px;
                        color: #D40511;
                        font-weight: bold;
                    }
                    .footer {
                        margin-top: 50px;
                        padding-top: 20px;
                        border-top: 2px solid #eee;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    }
                    .shipping-details {
                        margin: 20px 0;
                        padding: 20px;
                        background: #f8f9fa;
                        border-radius: 5px;
                    }
                    table {
                        width: 100%;
                        margin: 20px 0;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 12px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                    }
                    th {
                        background-color: #f8f9fa;
                        font-weight: 600;
                        color: #555;
                    }
                    .highlight {
                        background-color: #fff3cd;
                        padding: 10px;
                        border-radius: 4px;
                        margin: 20px 0;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Shipping Quote</h1>
                    <p class="quote-number">Quote #${quoteNumber}</p>
                    <p>Generated on ${today}</p>
                </div>
                
                <div class="shipping-details">
                    <h2>Shipping Details</h2>
                    <table>
                        <tr>
                            <th>From Country:</th>
                            <td>${formData.get('fromCountry')}</td>
                        </tr>
                        <tr>
                            <th>To Country:</th>
                            <td>${formData.get('toCountry')}</td>
                        </tr>
                        <tr>
                            <th>Weight:</th>
                            <td>${formData.get('weight')} kg</td>
                        </tr>
                        <tr>
                            <th>Dimensions:</th>
                            <td>${formData.get('length')} x ${formData.get('width')} x ${formData.get('height')} cm</td>
                        </tr>
                        <tr>
                            <th>Shipping Date:</th>
                            <td>${formData.get('shippingDate')}</td>
                        </tr>
                    </table>
                </div>

                <div class="quote-details">
                    <h2>${capitalizeFirstLetter(quote.service)} Shipping Service</h2>
                    <p class="price">$${quote.price}</p>
                    <p><strong>Estimated Delivery:</strong> ${quote.estimated_delivery.min} - ${quote.estimated_delivery.max}</p>
                    <p><strong>Delivery Time:</strong> ${quote.delivery_days} business days</p>
                </div>

                <div class="highlight">
                    Note: This is an estimated quote based on the information provided. 
                    Final shipping costs may vary based on actual weight and dimensions at the time of shipping.
                </div>

                <div class="footer">
                    <p>This quote is valid for 24 hours from the generation date.</p>
                    <p>Terms and conditions apply. For more information, please contact our customer service.</p>
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Wait for styles to load before printing
        setTimeout(() => {
            printWindow.print();
        }, 250);
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function generateQuoteNumber() {
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `Q${timestamp}${random}`;
    }
});