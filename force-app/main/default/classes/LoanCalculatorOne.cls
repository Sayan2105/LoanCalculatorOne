public class LoanCalculatorOne {
    
    //Enter the newly created records into the object
    @AuraEnabled
    public static void createLoanRecord(String loanAmount, String loanReason, Integer tenure, Decimal monthlyInstallment, Decimal annualInstallment) {
        Loan_Application__c newLoan = new Loan_Application__c(
            Loan_Amount__c = Decimal.valueOf(loanAmount),
            Loan_Reason__c = loanReason,
            Tenure__c = tenure
            // Not setting Monthly_Installment__c and Annual_Installment__c since they are formula fields
        );
        insert newLoan;
    }
    
    // Show all the records
    @AuraEnabled
	public static List<Loan_Application__c> getLoanRecords() {
    	return [SELECT Id, Loan_Amount__c, Loan_Reason__c, Tenure__c, Monthly_Installment__c FROM Loan_Application__c];
	}
    
    
    // Update all the records whose tenure = 12 to make the tenure = 16
    @AuraEnabled
	public static void updateLoanRecords() {
        List<Loan_Application__c> loans = [SELECT Id, Tenure__c FROM Loan_Application__c WHERE Tenure__c = 12];
        	for (Loan_Application__c loan : loans) {
            	loan.Tenure__c = 16;
        	}
    	update loans;
	}
    
    
    // Delete all the records where loan amount == 0
    @AuraEnabled
    public static void deleteLoanRecords() {
        List<Loan_Application__c> loans = [SELECT Id FROM Loan_Application__c WHERE Loan_Amount__c = 0];
        delete loans;
    }
    
}
