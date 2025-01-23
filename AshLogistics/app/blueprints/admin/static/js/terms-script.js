document.addEventListener('DOMContentLoaded', function() {
    // Sample tracking data (simulated database)
    const trackingData = {
        '1234567890': {
            status: 'In Transit',
            location: 'Frankfurt, Germany',
            lastUpdate: '2024-03-15T10:30:00',
            history: [
                { date: '2024-03-15T10:30:00', status: 'In Transit', location: 'Frankfurt, Germany' },
                { date: '2024-03-15T08:00:00', status: 'Processed', location: 'Frankfurt Hub' },
                { date: '2024-03-14T18:45:00', status: 'Picked Up', location: 'Berlin, Germany' }
            ]
        }
    };

    // Recent shipments data
    const recentShipments = [
        { trackingNumber: '1234567890', status: 'In Transit', lastUpdate: '2 hours ago' },
        { trackingNumber: '9876543210', status: 'Delivered', lastUpdate: '1 day ago' },
        { trackingNumber: '4567890123', status: 'Processing', lastUpdate: '30 minutes ago' }
    ];

    // Handle tracking form submission
    const trackingForm = document.getElementById('trackingForm');
    trackingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const trackingNumber = document.getElementById('trackingNumber').value;
        trackShipment(trackingNumber);
    });

    // Function to track shipment
    function trackShipment(trackingNumber) {
        const shipment = trackingData[trackingNumber];
        
        if (shipment) {
            // Create and show tracking result modal
            const modalHtml = `
                <div class="modal fade" id="trackingModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Tracking Details: ${trackingNumber}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="current-status mb-4">
                                    <h6>Current Status</h6>
                                    <div class="alert alert-info">
                                        ${shipment.status} - ${shipment.location}
                                        <br>
                                        <small>Last Updated: ${formatDate(shipment.lastUpdate)}</small>
                                    </div>
                                </div>
                                <div class="tracking-history">
                                    <h6>Tracking History</h6>
                                    <div class="timeline">
                                        ${shipment.history.map(event => `
                                            <div class="timeline-item mb-3">
                                                <div class="row">
                                                    <div class="col-md-3">
                                                        <small class="text-muted">${formatDate(event.date)}</small>
                                                    </div>
                                                    <div class="col-md-9">
                                                        <p class="mb-0"><strong>${event.status}</strong></p>
                                                        <p class="mb-0 text-muted">${event.location}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Remove existing modal if any
            const existingModal = document.getElementById('trackingModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Add new modal to document
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('trackingModal'));
            modal.show();
        } else {
            alert('Tracking number not found. Please check and try again.');
        }
    }

    // Function to format date
    function formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    // Populate recent shipments
    function displayRecentShipments() {
        const container = document.getElementById('recentShipments');
        const shipmentsHtml = recentShipments.map(shipment => `
            <div class="shipment-card card mb-3">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">Tracking #: ${shipment.trackingNumber}</h6>
                        <small class="text-muted">Last updated: ${shipment.lastUpdate}</small>
                    </div>
                    <span class="status-badge ${shipment.status.toLowerCase().replace(' ', '-')}">
                        ${shipment.status}
                    </span>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = shipmentsHtml;

        // Add click event to shipment cards
        document.querySelectorAll('.shipment-card').forEach(card => {
            card.addEventListener('click', function() {
                const trackingNumber = this.querySelector('h6').textContent.split(':')[1].trim();
                trackShipment(trackingNumber);
            });
        });
    }

    // Initialize recent shipments
    displayRecentShipments();
});