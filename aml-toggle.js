// AML Check Type Toggle
document.addEventListener('DOMContentLoaded', function() {
    const toggleButtons = document.querySelectorAll('.aml-check-toggle-btn');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.dataset.type;
            const container = this.closest('.card, .card-lg');
            
            // Update active state
            toggleButtons.forEach(btn => {
                if (btn.closest('.card, .card-lg') === container) {
                    btn.classList.remove('active');
                }
            });
            this.classList.add('active');
            
            // Toggle fields
            const addressField = container.querySelector('.aml-field-address');
            const transactionField = container.querySelector('.aml-field-transaction');
            
            if (type === 'address') {
                addressField.style.display = '';
                transactionField.style.display = 'none';
            } else {
                addressField.style.display = 'none';
                transactionField.style.display = '';
            }
        });
    });
});
