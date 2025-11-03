
package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class CustomerPage extends BasePage {

    public CustomerPage(WebDriver driver) {
        super(driver);
    }

    private By customerLoginBtn = By.xpath("//button[contains(text(),'Customer Login')]") ;
    private By userSelect = By.id("userSelect");
    private By loginBtn = By.xpath("//button[contains(text(),'Login')]") ;

    private By depositTab = By.xpath("//button[contains(text(),'Deposit')]") ;
    private By depositAmount = By.xpath("//input[@placeholder='amount']");
    private By depositBtn = By.xpath("//button[text()='Deposit']");

    private By transactionsBtn = By.xpath("//button[contains(text(),'Transactions')]") ;
    private By withdrawTab = By.xpath("//button[contains(text(),'Withdrawl') or contains(text(),'Withdraw')]");
    private By withdrawAmount = By.xpath("//input[@placeholder='amount']");
    private By withdrawBtn = By.xpath("//button[text()='Withdraw']");
    private By transactionRows = By.xpath("//table//tr");

    public void goToCustomerLogin() {
        driver.findElement(customerLoginBtn).click();
    }

    public void loginAs(String customerName) {
        org.openqa.selenium.support.ui.Select sel = new org.openqa.selenium.support.ui.Select(driver.findElement(userSelect));
        sel.selectByVisibleText(customerName);
        driver.findElement(loginBtn).click();
    }

    public void goToDeposit() {
        driver.findElement(depositTab).click();
    }

    public void depositAmount(String amount) {
        driver.findElement(depositAmount).clear();
        driver.findElement(depositAmount).sendKeys(amount);
        driver.findElement(depositBtn).click();
    }

    public void goToTransactions() {
        driver.findElement(transactionsBtn).click();
    }

    public void goToWithdraw() {
        driver.findElement(withdrawTab).click();
    }

    public void withdrawAmount(String amount) {
        driver.findElement(withdrawAmount).clear();
        driver.findElement(withdrawAmount).sendKeys(amount);
        driver.findElement(withdrawBtn).click();
    }

    public int getTransactionCount() {
        return driver.findElements(transactionRows).size();
    }
}
