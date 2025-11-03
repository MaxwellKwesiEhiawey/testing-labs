
XYZ Bank Automation - Selenium WebDriver (Java) 
==============================================

Structure:
- pom.xml
- src/main/java - (empty for now)
- src/test/java - tests, pages, utils
- testng.xml

Prerequisites:
- Java 11+ installed
- Maven installed
- Internet access to download Maven dependencies (first run)
- Chrome browser installed
- Allure (optional) installed for report viewing (https://docs.qameta.io/allure/)

How to run tests:
1. From project root run:
   mvn clean test

2. After execution, Allure results are generated under: target/allure-results
   To view an Allure report (if you have Allure CLI installed):
   allure serve target/allure-results

Notes:
- WebDriverManager is used in code to auto-download correct ChromeDriver.
- Tests are written using Page Object Model (pages package) and TestNG framework.
- Adjust timeouts and paths in BaseTest.java as needed.
