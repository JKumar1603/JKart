JKart E-Commerce Platform - Deployment Guide

Project Name:
JKart E-Commerce Platform - Multi-Vendor Marketplace

Technology Stack:
- Frontend: Angular
- Backend: Spring Boot Microservices
- Database: MySQL
- Service Discovery: Eureka Server
- API Gateway: Spring Cloud Gateway
- Java Version: JDK 21
- Build Tool: Maven

============================================================
1. SYSTEM REQUIREMENTS
============================================================

Before running the project, make sure the following software is installed:

1. JDK 21
2. Maven
3. MySQL Server
4. Eclipse IDE or Spring Tool Suite
5. Node.js and npm
6. Angular CLI
7. Postman
8. Web browser

============================================================
2. PROJECT MODULES
============================================================

Backend Microservices:

1. C01EurekaServer
2. C02ApiGateway
3. C03AuthService
4. C04ProductService
5. C05OrderService
6. C06NotificationService

Frontend:

1. C07MarketplaceUI / JKart Angular Application

============================================================
3. DATABASE SETUP
============================================================

Database Name:
ecomdb

MySQL Credentials Used:
Username: root
Password: Jay@1234

Steps:

1. Open MySQL Workbench.
2. Run the final database script:
   Database-Script.sql
3. Make sure the database is created successfully.
4. Start backend services once so that Spring Boot JPA can create/update tables if required.

Main Tables:

1. users
2. products
3. orders

Verification Queries:

SELECT * FROM users;
SELECT * FROM products;
SELECT * FROM orders;
SELECT DISTINCT category FROM products;

============================================================
4. BACKEND SERVICE STARTUP ORDER
============================================================

Start the backend services in the following order:

1. C01EurekaServer
2. C03AuthService
3. C04ProductService
4. C05OrderService
5. C06NotificationService
6. C02ApiGateway

Important:
C02ApiGateway should be started after the other backend services are registered in Eureka.

============================================================
5. BACKEND SERVICE PORTS
============================================================

C01EurekaServer:
Port: 8761
URL: http://localhost:8761

C02ApiGateway:
Port: 9090
Base URL: http://localhost:9090

C03AuthService:
Port: 8081
Route through Gateway: http://localhost:9090/api/auth

C04ProductService:
Port: 8082
Route through Gateway: http://localhost:9090/api/products

C05OrderService:
Port: 8083
Route through Gateway: http://localhost:9090/api/orders

C06NotificationService:
Port: 8084
Route through Gateway: http://localhost:9090/api/notifications

============================================================
6. RUNNING BACKEND SERVICES
============================================================

Steps for each Spring Boot project:

1. Open Eclipse or Spring Tool Suite.
2. Import the project as an existing Maven project.
3. Wait for Maven dependencies to download.
4. Open the main application class.
5. Run the project as Spring Boot App.

Recommended order:

1. Run C01EurekaServerApplication.
2. Open http://localhost:8761 and confirm Eureka dashboard is running.
3. Run C03AuthServiceApplication.
4. Run C04ProductServiceApplication.
5. Run C05OrderServiceApplication.
6. Run C06NotificationServiceApplication.
7. Run C02ApiGatewayApplication.
8. Refresh Eureka dashboard and confirm all services are registered.

Expected Eureka Registered Services:

- C02APIGATEWAY
- C03AUTHSERVICE
- C04PRODUCTSERVICE
- C05ORDERSERVICE
- C06NOTIFICATIONSERVICE

============================================================
7. FRONTEND SETUP
============================================================

Angular Project Name:
JKart

Project Location Example:
C:\Users\JA20696202\Desktop\Practice\Angular\JKart

Steps:

1. Open command prompt.
2. Navigate to the Angular project folder.

Command:
cd C:\Users\JA20696202\Desktop\Practice\Angular\JKart

3. Install dependencies if node_modules is not available.

Command:
npm install

4. Start Angular application.

Command:
ng serve

5. Open the application in browser.

URL:
http://localhost:4200

============================================================
8. ANGULAR APPLICATION PAGES
============================================================

Main Angular pages:

1. Home
2. Login
3. Register
4. Product List
5. Product Details
6. Cart
7. Order History
8. Payment
9. Invoice

============================================================
9. APPLICATION TESTING FLOW
============================================================

9.1 Vendor Flow

1. Login as Vendor.
2. Open Products page.
3. Click Add Product.
4. Enter product name, price, quantity, category, image URL, and description.
5. Save product.
6. Product should be created with PENDING status.

9.2 Admin Flow

1. Login as Admin.
2. Open Products page.
3. View pending products.
4. Click Approve.
5. Product status should become APPROVED.

9.3 Customer Flow

1. Login as Customer.
2. Open Products page.
3. Filter products by category.
4. Open Product Details.
5. Add product to cart.
6. Open Cart.
7. Place order.
8. Open Orders page.
9. Click Pay Now.
10. Complete payment.
11. Open Invoice page.
12. Download invoice PDF.

============================================================
10. POSTMAN TESTING
============================================================

Use API Gateway base URL:
http://localhost:9090

Recommended Postman collection file/list:
JKart-Final-Postman-API-Collection-List.txt

Main API groups:

1. Auth APIs
2. Product APIs
3. Order APIs
4. Notification APIs

Important Test APIs:

GET http://localhost:9090/api/products/test
GET http://localhost:9090/api/orders/test
GET http://localhost:9090/api/notifications/test
POST http://localhost:9090/api/auth/register
POST http://localhost:9090/api/auth/login
GET http://localhost:9090/api/products/approved
POST http://localhost:9090/api/orders
PUT http://localhost:9090/api/orders/{orderId}/pay

============================================================
11. IMPORTANT CONFIGURATION NOTES
============================================================

1. Start Eureka Server before all backend services.
2. Start API Gateway after all main services are running.
3. Angular should call backend APIs through API Gateway using port 9090.
4. MySQL database name should be ecomdb.
5. Product images are stored as image URLs in the products table.
6. Cart data is stored temporarily in Angular localStorage.
7. Notification Service currently logs notifications in the console.
8. Actual email sending can be added later using JavaMailSender and SMTP configuration.

============================================================
12. COMMON ERRORS AND FIXES
============================================================

Issue:
API Gateway gives 503 or service unavailable.

Fix:
Check Eureka dashboard and confirm the target service is registered. Restart API Gateway after services are registered.

------------------------------------------------------------

Issue:
Angular page keeps loading.

Fix:
Check backend service status, API Gateway routing, and browser Network tab. Restart Angular and backend services if required.

------------------------------------------------------------

Issue:
Products are not visible for customer.

Fix:
Make sure product status is APPROVED.

------------------------------------------------------------

Issue:
Category filter shows no product.

Fix:
Check product category values in database using:
SELECT DISTINCT category FROM products;

------------------------------------------------------------

Issue:
Payment does not open invoice.

Fix:
Make sure order exists and payment API updates payment_status to PAID.

============================================================
13. FINAL DEMO CHECKLIST
============================================================

Before project demonstration, verify:

1. Eureka dashboard is running.
2. All backend services are registered.
3. API Gateway is running on port 9090.
4. Angular is running on port 4200.
5. Login works for Customer, Vendor, and Admin.
6. Product add and approval flow works.
7. Customer can browse and filter products.
8. Cart and order placement work.
9. Payment works.
10. Invoice PDF downloads.
11. Postman APIs are tested.
12. Database tables have valid records.

============================================================
14. SUMMARY
============================================================

The JKart E-Commerce Platform is deployed locally using Angular, Spring Boot Microservices, Eureka Server, API Gateway, and MySQL. The Angular frontend communicates with backend services through API Gateway. Eureka handles service discovery. MySQL stores user, product, and order data. The application supports customer shopping, vendor product management, admin approval workflow, order placement, payment processing, invoice generation, and simulated notification logging.
