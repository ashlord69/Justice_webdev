document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    const totalSteps = 4;
    const form = document.getElementById('shipmentForm');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const progressBar = document.querySelector('.progress-bar');

    // Shipping rate calculation (simulated)
    const shippingRates = {
        'express': { base: 50, perKg: 10 },
        'economy': { base: 30, perKg: 7 },
        'domestic': { base: 20, perKg: 5 }
    };

    function updateProgress() {
        // Update progress bar
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progress}%`;

        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            if (index + 1 < currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (index + 1 === currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('completed', 'active');
            }
        });

        // Show/hide steps
        for (let i = 1; i <= totalSteps; i++) {
            const stepElement = document.getElementById(`step${i}`);
            if (stepElement) {
                stepElement.style.display = i === currentStep ? 'block' : 'none';
            }
        }

        // Update buttons
        prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
        nextBtn.textContent = currentStep === totalSteps ? 'Submit' : 'Next';
    }

    function validateStep(step) {
        const currentStepElement = document.getElementById(`step${step}`);
        const inputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value) {
                isValid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });

        return isValid;
    }

    function calculateShippingCost() {
        const serviceType = document.querySelector('[name="serviceType"]').value;
        const weight = parseFloat(document.querySelector('[name="weight"]').value) || 0;
        const insurance = document.querySelector('[name="insurance"]').checked;
        const signature = document.querySelector('[name="signature"]').checked;

        const rate = shippingRates[serviceType];
        const shippingCost = rate.base + (weight * rate.perKg);
        const insuranceCost = insurance ? (shippingCost * 0.1) : 0;
        const signatureCost = signature ? 5 : 0;
        const totalCost = shippingCost + insuranceCost + signatureCost;

        document.getElementById('shippingCost').textContent = `$${shippingCost.toFixed(2)}`;
        document.getElementById('insuranceCost').textContent = `$${insuranceCost.toFixed(2)}`;
        document.getElementById('additionalCost').textContent = `$${signatureCost.toFixed(2)}`;
        document.getElementById('totalCost').textContent = `$${totalCost.toFixed(2)}`;
    }

    nextBtn.addEventListener('click', function() {
        if (!validateStep(currentStep)) {
            return;
        }

        if (currentStep === totalSteps) {
            // Handle form submission
            handleSubmission();
        } else {
            currentStep++;
            updateProgress();

            if (currentStep === 4) {
                calculateShippingCost();
            }
        }
    });

    prevBtn.addEventListener('click', function() {
        if (currentStep > 1) {
            currentStep--;
            updateProgress();
        }
    });

    // Handle form input changes for real-time validation
    form.addEventListener('input', function(e) {
        if (e.target.hasAttribute('required')) {
            if (e.target.value) {
                e.target.classList.remove('is-invalid');
            }
        }

        // Recalculate shipping cost when package details change
        if (currentStep === 4) {
            calculateShippingCost();
        }
    });

    function handleSubmission() {
        // Simulate form submission
        const formData = new FormData(form);
        const shipmentData = Object.fromEntries(formData.entries());
        
        // Show loading state
        nextBtn.disabled = true;
        nextBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

        // Simulate API call
        setTimeout(() => {
            // Create success modal
            const modalHtml = `
                <div class="modal fade" id="successModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Shipment Confirmed</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="text-center mb-4">
                                    <div class="text-success mb-3">
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                    </div>
                                    <h4>Thank You!</h4>
                                    <p>Your shipment has been confirmed and will be processed shortly.</p>
                                </div>
                                <div class="alert alert-info">
                                    <strong>Tracking Number:</strong> 
                                    <span id="trackingNumber">DHL${Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                                </div>
                                <p class="mb-0">You will receive a confirmation email with shipping details and tracking information.</p>
                            </div>
                            <div class="modal-footer">
                                <a href="/tracking/track" class="btn btn-primary">Track Shipment</a>
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Add modal to document
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Show success modal
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();

            // Reset form and button state
            nextBtn.disabled = false;
            nextBtn.textContent = 'Submit';
            
            // Reset form after modal is closed
            document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
                form.reset();
                currentStep = 1;
                updateProgress();
                this.remove();
            });
        }, 2000);
    }

    // Initialize progress
    updateProgress();
});