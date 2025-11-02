
package tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;

import java.time.Duration;

/**
 * Base test class providing common setup and teardown for all test classes.
 * This is not a test class itself, but provides shared configuration.
 */
@SuppressWarnings("java:S2187") // Suppress "Add at least one test" warning - this is a base class
public class BaseTest {
    protected WebDriver driver;
    protected String baseUrl = "https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login";

    @BeforeClass
    public void setUp() {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(8));
        driver.get(baseUrl);
    }

    @AfterClass
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    /**
     * Helper method to replace Thread.sleep with implicit wait
     * @param milliseconds time to wait
     */
    protected void waitForElement(int milliseconds) {
        driver.manage().timeouts().implicitlyWait(Duration.ofMillis(milliseconds));
        // Reset to default after brief wait
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(8));
    }
}
