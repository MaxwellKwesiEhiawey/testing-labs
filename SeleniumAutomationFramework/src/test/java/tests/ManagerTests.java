
package tests;

import org.testng.Assert;
import org.testng.annotations.Test;
import pages.ManagerPage;

public class ManagerTests extends BaseTest {

    @Test(priority = 1)
    public void addCustomerCreateAndDeleteFlow() throws InterruptedException {
        ManagerPage manager = new ManagerPage(driver);

        // Add Customer
        manager.goToAddCustomer();
        manager.addCustomer("Jane","Doe","12345");
        String alert = manager.getAlertTextAndAccept();
        // Alert typically contains success message; assert contains 'success' or 'Customer'
        Assert.assertTrue(alert.toLowerCase().contains("success") || alert.toLowerCase().contains("customer"), "Expected success alert after adding customer");

        // Create account
        manager.goToOpenAccount();
        // Wait a short while for selects to populate
        Thread.sleep(1000);
        manager.createAccountFor("Jane Doe","Dollar");
        String alert2 = manager.getAlertTextAndAccept();
        Assert.assertTrue(alert2.toLowerCase().contains("success") || alert2.toLowerCase().contains("account"));

        // Go to customers and delete (cleanup)
        manager.goToCustomersList();
        boolean deleted = manager.deleteFirstCustomerIfExists();
        Assert.assertTrue(deleted, "Expected to find and delete a customer record in Customers list");
    }
}
