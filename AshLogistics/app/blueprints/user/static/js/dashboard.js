document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    
    // Refresh data every 5 minutes
    setInterval(loadDashboardData, 300000);
});

async function loadDashboardData() {
    try {
        const response = await fetch('/user/api/quotes');
        const data = await response.json();
        
        if (data.success) {
            updateStats(data.stats);
            updateQuotesTable(data.quotes);
        } else {
            showError(data.error || 'Failed to load dashboard data');
        }
    } catch (error) {
        showError('Error loading dashboard data: ' + error.message);
    }
}

function updateStats(stats) {
    document.getElementById('totalQuotes').textContent = stats.total_quotes;
    document.getElementById('internationalQuotes').textContent = stats.international_quotes;
    document.getElementById('domesticQuotes').textContent = stats.domestic_quotes;
}

function updateQuotesTable(quotes) {
    const tableBody = document.getElementById('quotesTableBody');
    tableBody.innerHTML = '';

    if (!quotes || quotes.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="p-4">
                        <p class="text-muted mb-2">No quotes found</p>
                        <a href="/shipping/quote" class="btn btn-primary">Create New Quote</a>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    quotes.forEach(quote => {
        const dimensions = quote.package_details?.dimensions || {};
        const services = quote.quotes || [];
        const createdAt = formatDate(quote.created_at);
        
        tableBody.innerHTML += `
            <tr>
                <td>${createdAt}</td>
                <td>${quote.package_details?.from_country || 'N/A'}</td>
                <td>${quote.package_details?.to_country || 'N/A'}</td>
                <td>${quote.package_details?.weight || 0} kg</td>
                <td>
                    ${dimensions.length || 0} × 
                    ${dimensions.width || 0} × 
                    ${dimensions.height || 0} cm
                </td>
                <td>
                    ${services.map(q => `
                        <span class="badge bg-primary me-1">
                            ${capitalizeFirstLetter(q.service)}: $${formatPrice(q.price)}
                        </span>
                    `).join('')}
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" 
                                onclick="printQuote('${quote._id}')" 
                                title="Print Quote">
                            <i class="bi bi-printer"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" 
                                onclick="viewQuoteDetails('${quote._id}')" 
                                title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        <a href="/shipping/quote" 
                           class="btn btn-sm btn-primary" 
                           title="Create New Quote">
                            <i class="bi bi-plus"></i>
                        </a>
                    </div>
                </td>
            </tr>
        `;
    });
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

function formatPrice(price) {
    if (!price) return '0.00';
    return Number(price).toFixed(2);
}

function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function showError(message) {
    console.error(message);
    // Create and show error toast
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = 'toast show bg-danger text-white';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="toast-header bg-danger text-white">
            <strong class="me-auto">Error</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}

async function printQuote(quoteId) {
    try {
        const response = await fetch(`/user/api/quotes/${quoteId}`);
        if (!response.ok) throw new Error('Failed to fetch quote');
        const quote = await response.json();
        
        // Create print window
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            throw new Error('Pop-up blocked. Please allow pop-ups and try again.');
        }

        // Generate print content
        const printContent = generatePrintContent(quote);
        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for images to load before printing
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    } catch (error) {
        showError('Error printing quote: ' + error.message);
    }
}

function generatePrintContent(quote) {
    const dimensions = quote.package_details?.dimensions || {};
    const services = quote.quotes || [];
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Shipping Quote #${quote._id}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .quote-details { margin-bottom: 20px; }
                .services { margin-top: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; border: 1px solid #ddd; }
                th { background-color: #f5f5f5; }
                @media print {
                    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Shipping Quote</h1>
                <p>Generated on ${formatDate(quote.created_at)}</p>
            </div>
            <div class="quote-details">
                <h2>Package Details</h2>
                <table>
                    <tr>
                        <th>From</th>
                        <td>${quote.package_details?.from_country || 'N/A'}</td>
                        <th>To</th>
                        <td>${quote.package_details?.to_country || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Weight</th>
                        <td>${quote.package_details?.weight || 0} kg</td>
                        <th>Dimensions</th>
                        <td>${dimensions.length || 0} × ${dimensions.width || 0} × ${dimensions.height || 0} cm</td>
                    </tr>
                </table>
            </div>
            <div class="services">
                <h2>Shipping Options</h2>
                <table>
                    <tr>
                        <th>Service</th>
                        <th>Price</th>
                        <th>Estimated Delivery</th>
                    </tr>
                    ${services.map(service => `
                        <tr>
                            <td>${capitalizeFirstLetter(service.service)}</td>
                            <td>$${formatPrice(service.price)}</td>
                            <td>${service.delivery_days || 'N/A'} days</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        </body>
        </html>
    `;
}

async function viewQuoteDetails(quoteId) {
    try {
        const response = await fetch(`/user/api/quotes/${quoteId}`);
        if (!response.ok) throw new Error('Failed to fetch quote details');
        const quote = await response.json();
        
        // Create and show modal with quote details
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'quoteDetailsModal';
        modal.setAttribute('tabindex', '-1');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Quote Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="quote-details">
                            <h6>Package Information</h6>
                            <table class="table">
                                <tr>
                                    <th>From:</th>
                                    <td>${quote.package_details?.from_country || 'N/A'}</td>
                                    <th>To:</th>
                                    <td>${quote.package_details?.to_country || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <th>Weight:</th>
                                    <td>${quote.package_details?.weight || 0} kg</td>
                                    <th>Dimensions:</th>
                                    <td>${quote.package_details?.dimensions?.length || 0} × 
                                        ${quote.package_details?.dimensions?.width || 0} × 
                                        ${quote.package_details?.dimensions?.height || 0} cm</td>
                                </tr>
                            </table>
                            
                            <h6 class="mt-4">Shipping Options</h6>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Price</th>
                                        <th>Delivery Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${(quote.quotes || []).map(q => `
                                        <tr>
                                            <td>${capitalizeFirstLetter(q.service)}</td>
                                            <td>$${formatPrice(q.price)}</td>
                                            <td>${q.delivery_days || 'N/A'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="printQuote('${quote._id}')">
                            <i class="bi bi-printer"></i> Print Quote
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // Clean up modal when hidden
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    } catch (error) {
        showError('Error viewing quote details: ' + error.message);
    }
}