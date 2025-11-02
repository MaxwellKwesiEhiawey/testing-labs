
package pages;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class ManagerPage extends BasePage {

    public ManagerPage(WebDriver driver) {
        super(driver);
    }

    private By addCustomerBtn = By.xpath("//button[contains(text(),'Add Customer')]");
    private By firstName = By.xpath("//input[@placeholder='First Name']");
    private By lastName = By.xpath("//input[@placeholder='Last Name']");
    private By postCode = By.xpath("//input[@placeholder='Post Code']");
    private By submitAddCustomer = By.xpath("//button[@type='submit']");

    private By openAccountBtn = By.xpath("//button[contains(text(),'Open Account')]") ;
    private By customerSelect = By.id("userSelect");
    private By currencySelect = By.id("currency");
    private By processBtn = By.xpath("//button[contains(text(),'Process')]") ;

    private By customersBtn = By.xpath("//button[contains(text(),'Customers')]") ;
    private By deleteBtnTemplate = By.xpath("//button[text()='Delete']");

    public void goToAddCustomer() {
        driver.findElement(addCustomerBtn).click();
    }

    public void addCustomer(String fName, String lName, String pCode) {
        driver.findElement(firstName).sendKeys(fName);
        driver.findElement(lastName).sendKeys(lName);
        driver.findElement(postCode).sendKeys(pCode);
        driver.findElement(submitAddCustomer).click();
    }

    public String getAlertTextAndAccept() {
        Alert alert = driver.switchTo().alert();
        String txt = alert.getText();
        alert.accept();
        return txt;
    }

    public void goToOpenAccount() {
        driver.findElement(openAccountBtn).click();
    }

    public void createAccountFor(String customerName, String currency) {
        org.openqa.selenium.support.ui.Select selectCust = new org.openqa.selenium.support.ui.Select(driver.findElement(customerSelect));
        selectCust.selectByVisibleText(customerName);

        org.openqa.selenium.support.ui.Select selectCur = new org.openqa.selenium.support.ui.Select(driver.findElement(currencySelect));
        selectCur.selectByVisibleText(currency);

        driver.findElement(processBtn).click();
    }

    public void goToCustomersList() {
        driver.findElement(customersBtn).click();
    }

    public boolean deleteFirstCustomerIfExists() {
        try {
            WebElement del = driver.findElement(deleteBtnTemplate);
            del.click();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
