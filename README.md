# FarmStock — Farmer's Produce Inventory Tracker

FarmStock is a Spring Boot and MySQL application for recording crops, harvest batches and sales. The browser dashboard reads and writes data through the existing REST API. The backend remains responsible for validating sales against current stock.

## Requirements

- Java 17
- MySQL server
- Maven (or use the included Maven wrapper)
- Internet access to display the farm photograph used on the sign-in and overview banners

## Run the application

1. Start MySQL and create the database if it does not exist:

   ```sql
   CREATE DATABASE farmstock;
   ```

2. Open `src/main/resources/application.properties` and set `spring.datasource.username` and `spring.datasource.password` to your local MySQL credentials. The project keeps `spring.jpa.hibernate.ddl-auto=update`; it does not reset existing tables or data.

3. From the project root, run on Windows:

   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

   Or on macOS/Linux:

   ```bash
   ./mvnw spring-boot:run
   ```

4. Open the app at <http://localhost:8080>.

## Sign in

FarmStock uses one shared farm account because the existing inventory database is shared and is not separated into per-user records. There is no self-service registration, so one farm's inventory cannot accidentally appear to belong to multiple separate account records. The local demonstration account is:

- Username: `farmer`
- Password: `FarmStock@123`

Before using this outside a local demonstration, change the credentials. You can set them as environment variables before starting the app:

```powershell
$env:FARMSTOCK_LOGIN_USERNAME = "your-farm-name"
$env:FARMSTOCK_LOGIN_PASSWORD = "choose-a-strong-password"
.\mvnw.cmd spring-boot:run
```

The configured password is passed through Spring Security's password encoder at startup. Login and logout use Spring Security sessions and CSRF protection. The existing crop, harvest, sales and stock routes require an authenticated session; the inventory APIs and stored business data are otherwise unchanged. Authentication users live in memory, so the configured farm account is available again after each restart.

The sign-in and overview photos are by [Sourav Debnath on Unsplash](https://unsplash.com/photos/sunrise-over-a-green-field-and-tree-line-WEIqEl7exFc), under the Unsplash License. They are referenced from Unsplash and load when the app has internet access; the layout keeps its green fallback styling if the photo cannot load.

## Main API routes

- `GET /api/crops` — list crops; `POST /api/crops` — create a crop
- `GET /api/crops/{id}` and `PUT /api/crops/{id}` — view or update a crop
- `DELETE /api/crops/{id}` — delete a crop (the database may reject deletion when records are linked)
- `GET /api/harvests` — list harvests
- `POST /api/harvests/crop/{cropId}` — record a harvest
- `GET /api/harvests/crop/{cropId}` — list harvests for a crop
- `GET /api/sales` — list sales
- `POST /api/sales/crop/{cropId}` — record a sale; the backend rejects quantities above available stock
- `GET /api/sales/crop/{cropId}/stock` — get current stock
- `GET /api/sales/crop/{cropId}/revenue?startDate=2026-09-01&endDate=2026-09-30` — get revenue for a date range

## Example data

Create a crop using the dashboard or send:

```json
{"name":"Tomato Premium","category":"Vegetable"}
```

For the returned crop ID, record a harvest:

```json
{"quantity":400,"harvestDate":"2026-09-28"}
```

Then try a sale such as:

```json
{"quantity":50,"pricePerUnit":40,"saleDate":"2026-09-28"}
```

Trying to sell more than the remaining quantity should return the backend's insufficient-stock error. Dates should use `YYYY-MM-DD` format.

## Dashboard notes

The overview derives totals from `/api/crops`, `/api/harvests`, `/api/sales` and the per-crop stock endpoint. Revenue on the overview is the sum of recorded sale quantity multiplied by unit price; the Revenue page uses the backend's date-range report. The stock chart and recent activity list are built from current crop, harvest and sale records. All listed records and summary values come from the database APIs, not demo fixtures.

## Using the pages

1. **Crops:** add a crop name and category. Use search or the category filter to find it later. Edit updates the existing crop through `PUT`; delete asks for confirmation and uses the existing `DELETE` route.
2. **Harvests:** choose a crop, enter a positive quantity and harvest date, then record the batch. The history shows the database harvest ID returned by the API.
3. **Sales:** choose a crop and the page checks its available stock for you. Record the quantity, unit price and date. The interface reports the backend's stock error in plain language if a sale is too large; the server remains responsible for preventing overselling.
4. **Current stock:** choose a crop to see total harvested, total sold and the live remaining quantity from the stock endpoint.
5. **Revenue:** choose a crop and date range. The page checks that the start date is not after the end date and displays the report from the revenue endpoint.

On a phone, use the menu button at the top to open navigation. The dashboard and forms work with the same live API data as the desktop view.
