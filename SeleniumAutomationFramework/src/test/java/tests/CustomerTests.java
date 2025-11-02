
package tests;

import org.testng.Assert;
import org.testng.annotations.Test;
import pages.CustomerPage;
import pages.ManagerPage;

public class CustomerTests extends BaseTest {

    @Test(priority = 1)
    public void depositAndWithdrawFlow() {
        // Reuse ManagerPage to ensure at least one account exists for test; create if needed
        ManagerPage manager = new ManagerPage(driver);
        manager.goToAddCustomer();
        manager.addCustomer("Auto","User","99999");
        manager.getAlertTextAndAccept();

        manager.goToOpenAccount();
        waitForElement(1000);
        manager.createAccountFor("Auto User","Dollar");
        manager.getAlertTextAndAccept();

        // Customer login and deposit/withdraw
        CustomerPage customer = new CustomerPage(driver);
        customer.goToCustomerLogin();
        waitForElement(1000);
        customer.loginAs("Auto User");

        // Deposit
        customer.goToDeposit();
        customer.depositAmount("100");
        // no explicit success element always reliable; wait briefly
        waitForElement(500);

        // Withdraw
        customer.goToWithdraw();
        customer.withdrawAmount("50");
        waitForElement(500);

        // Transactions count should be >= 2 (deposit + withdrawal)
        customer.goToTransactions();
        int txCount = customer.getTransactionCount();
        Assert.assertTrue(txCount >= 2, "Expected at least 2 transaction rows after deposit and withdrawal");
    }
}
