document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    const totalSteps = 4;
    const form = document.getElementById('shippingForm');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const progressBar = document.querySelector('.progress-bar');

    // Load countries
    loadCountries();

    // Initialize form
    updateProgress();
    setupFormValidation();
    setupPriceCalculation();

    async function loadCountries() {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all');
            const countries = await response.json();
            
            const sortedCountries = countries
                .map(country => ({
                    code: country.cca2,
                    name: country.name.common
                }))
                .sort((a, b) => a.name.localeCompare(b.name));

            const countrySelects = document.querySelectorAll('select[name$="country"]');
            const options = sortedCountries.map(country => 
                `<option value="${country.code}">${country.name}</option>`
            ).join('');

            countrySelects.forEach(select => {
                select.innerHTML = '<option value="">Select Country</option>' + options;
            });
        } catch (error) {
            console.error('Error loading countries:', error);
        }
    }

    function updateProgress() {
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progress}%`;

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
        document.querySelectorAll('.step-content').forEach((step, index) => {
            step.style.display = index + 1 === currentStep ? 'block' : 'none';
        });

        prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
        nextBtn.textContent = currentStep === totalSteps ? 'Submit' : 'Next';
    }

    function validateStep(step) {
        const currentStepElement = document.getElementById(`step${step}`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value) {
                isValid = false;
                field.classList.add('is-invalid');
            } else {
                field.classList.remove('is-invalid');
            }
        });

        return isValid;
    }

    function setupFormValidation() {
        form.addEventListener('input', function(e) {
            if (e.target.hasAttribute('required')) {
                if (e.target.value) {
                    e.target.classList.remove('is-invalid');
                }
            }
        });
    }

    function setupPriceCalculation() {
        const priceInputs = document.querySelectorAll('input[name="weight"], select[name="service_type"], input[name="insurance"], input[name="signature"]');
        
        priceInputs.forEach(input => {
            input.addEventListener('change', calculatePrice);
        });
    }

    function calculatePrice() {
        const serviceType = document.querySelector('select[name="service_type"]').value;
        const weight = parseFloat(document.querySelector('input[name="weight"]').value) || 0;
        const insurance = document.querySelector('input[name="insurance"]').checked;
        const signature = document.querySelector('input[name="signature"]').checked;
        
        const rates = {
            'express': { base: 50, perKg: 10 },
            'priority': { base: 35, perKg: 8 },
            'economy': { base: 25, perKg: 5 }
        };

        if (!serviceType) return;

        const rate = rates[serviceType];
        const baseShipping = rate.base + (weight * rate.perKg);
        const insuranceCost = insurance ? (parseFloat(document.querySelector('input[name="declared_value"]').value) * 0.01) : 0;
        const signatureCost = signature ? 5 : 0;
        const total = baseShipping + insuranceCost + signatureCost;

        document.getElementById('baseShipping').textContent = `$${baseShipping.toFixed(2)}`;
        document.getElementById('insuranceCost').textContent = `$${insuranceCost.toFixed(2)}`;
        document.getElementById('additionalCost').textContent = `$${signatureCost.toFixed(2)}`;
        document.getElementById('totalCost').textContent = `$${total.toFixed(2)}`;
        
        document.querySelector('input[name="total_cost"]').value = total;
    }

    async function handleSubmission() {
        if (!validateStep(currentStep)) return;

        nextBtn.disabled = true;
        nextBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                showSuccessModal(result.tracking_number);
            } else {
                throw new Error(result.message || 'Failed to create shipment');
            }
        } catch (error) {
            showErrorAlert(error.message);
        } finally {
            nextBtn.disabled = false;
            nextBtn.textContent = 'Submit';
        }
    }

    function showSuccessModal(trackingNumber) {
        const modalHtml = `
            <div class="modal fade" id="successModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Shipment Created Successfully</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <div class="text-success mb-4">
                                <svg width="64" height="64" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <h4 class="mb-3">Thank You!</h4>
                            <p class="mb-4">Your shipment has been created successfully.</p>
                            <div class="alert alert-info">
                                <strong>Tracking Number:</strong><br>
                                <span class="fs-5">${trackingNumber}</span>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <a href="/tracking/${trackingNumber}" class="btn btn-primary">Track Shipment</a>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();

        document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
            window.location.href = '/dashboard';
        });
    }

    function showErrorAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 5000);
    }

    // Event Listeners
    nextBtn.addEventListener('click', function() {
        if (currentStep === totalSteps) {
            handleSubmission();
        } else if (validateStep(currentStep)) {
            currentStep++;
            updateProgress();
            if (currentStep === totalSteps) {
                calculatePrice();
            }
        }
    });

    prevBtn.addEventListener('click', function() {
        if (currentStep > 1) {
            currentStep--;
            updateProgress();
        }
    });
});