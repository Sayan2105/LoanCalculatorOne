import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createLoanRecord from '@salesforce/apex/LoanCalculatorOne.createLoanRecord';
import getLoanRecords from '@salesforce/apex/LoanCalculatorOne.getLoanRecords';
import updateLoanRecords from '@salesforce/apex/LoanCalculatorOne.updateLoanRecords';
import deleteLoanRecords from '@salesforce/apex/LoanCalculatorOne.deleteLoanRecords';

export default class LoanCalculator extends LightningElement {
    @track loanAmount = 0; // Default value
    @track loanReason = '';
    @track tenure = 12; // Default value
    @track monthlyInstallment = 0;
    @track annualInstallment = 0;
    @track showResult = false;
    @track loanRecords = [];

    loanOptions = [
        { label: 'Home Loan', value: 'Home Loan' },
        { label: 'Car Loan', value: 'Car Loan' },
        { label: 'Education Loan', value: 'Education Loan' },
        { label: 'Personal Loan', value: 'Personal Loan' }
    ];

    handleLoanAmountChange(event) {
        this.loanAmount = parseFloat(event.target.value) || 0; // Default to 0 if input is invalid
    }

    handleLoanReasonChange(event) {
        this.loanReason = event.target.value;
    }

    handleTenureChange(event) {
        this.tenure = parseInt(event.target.value, 10) || 12; // Default to 12 months if input is invalid
    }

    calculateInstallments() {
        try {
            // Validate tenure to avoid division by zero
            if (this.tenure <= 0) {
                this.showToast('Error', 'Tenure must be greater than 0', 'error');
                return;
            }

            const interestRate = this.getAccurateInterestRate(this.loanReason);
            const monthlyInstallment = this.calculateMonthlyInstallment(this.loanAmount, interestRate, this.tenure);
            this.monthlyInstallment = monthlyInstallment.toFixed(2);

            this.annualInstallment = (this.calculateAnnualInstallment(monthlyInstallment)).toFixed(2);

            this.showResult = true;

            // Call Apex method to create a new record, excluding formula fields
            createLoanRecord({
                loanAmount: this.loanAmount.toString(),
                loanReason: this.loanReason,
                tenure: this.tenure
            })
            .then(() => {
                this.showToast('Success', 'Record created successfully', 'success');
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });

        } catch (error) {
            console.error('Error occurred in calculateInstallments: ', error);
        }
    }

    calculateMonthlyInstallment(loanAmount, interestRate, tenure) {
        try {
            // Monthly interest rate is the annual rate divided by 1200 (e.g., 0.75% becomes 0.0075)
            const rate = interestRate / 1200;
            let monthlyInstallment;

            if (rate === 0) {
                monthlyInstallment = loanAmount / tenure;
            } else {
                // Using the amortization formula
                const numerator = rate * loanAmount;
                const denominator = 1 - Math.pow(1 + rate, -tenure);

                monthlyInstallment = numerator / denominator;
            }
            return monthlyInstallment;
        } catch (error) {
            throw new Error('Error in calculateMonthlyInstallment: ' + error.message);
        }
    }

    calculateAnnualInstallment(monthlyInstallment) {
        try {
            return monthlyInstallment * 12;
        } catch (error) {
            throw new Error('Error in calculateAnnualInstallment: ' + error.message);
        }
    }

    getAccurateInterestRate(loanReason) {
        try {
            let interestRate;

            switch (loanReason) {
                case 'Home Loan':
                    interestRate = 0.75;  // Base rate
                    break;
                case 'Car Loan':
                    interestRate = 0.85;  // Base rate
                    break;
                case 'Education Loan':
                    interestRate = 0.65;  // Base rate
                    break;
                case 'Personal Loan':
                    interestRate = 1.0;   // Base rate
                    break;
                default:
                    interestRate = 0;
                    break;
            }

            // Detailed calculation based on multiple factors
            const economicFactor = 1.02; // Example factor due to market conditions
            const customerRiskFactor = 1.01; // Example factor based on customer's credit score

            // The final interest rate is adjusted based on these factors
            interestRate = interestRate * economicFactor * customerRiskFactor;

            return parseFloat(interestRate.toFixed(2)); // Returning a detailed, precise rate
        } catch (error) {
            throw new Error('Error in getAccurateInterestRate: ' + error.message);
        }
    }

    handleGetLoanRecords() {
        getLoanRecords()
            .then(result => {
                this.loanRecords = result;
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });

        this.loanRecords = fetchedRecords || [];
    }

    handleUpdateLoanRecords() {
        updateLoanRecords()
            .then(() => {
                this.showToast('Success', 'Records updated successfully', 'success');
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
        }

    handleDeleteLoanRecords() {
        deleteLoanRecords()
            .then(() => {
                this.showToast('Success', 'Records deleted successfully', 'success');
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
        }



    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}