# Healthcare Provider Catalog API Documentation

## Authentication

## Run the application

docker compose up --build

For migration:

docker compose exec api rails db:migrate

http://localhost:3000/ - Rails
http://localhost:8080/login - React

### Register a New User
Base URL
All endpoints are relative to the base URL:
http://localhost:3000/api/v1

Authentication:

The API uses JWT (JSON Web Token) authentication. After successful login, include the token in the Authorization header for all protected endpoints:


User Authentication

Register a new user account.
**POST /api/v1/register**

Request body:
```json
{
  "user": {
    "email": "physician@example.com",
    "password": "secure_password123",
    "password_confirmation: "secure_password123",
  }
}
```
response
```{
  "status": {
    "code": 200,
    "message": "Signed up successfully."
  },
  "data": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2025-03-17T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIU787879zI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2Nzg5NTU2MDB9.example_token_signature"
} 
```


# Login
**POST /api/v1/login**
#request
```{
  "user": {
    "email": "physician@example.com",
    "password": "secure_password123"
  }
}
```
Response:
```
{
  "status": {
    "code": 200,
    "message": "Logged in successfully."
  },
  "data": {
    "id": 1,
    "email": "physicianr@example.com",
    "created_at": "2025-03-17T12:00:00.000Z"
  }
}
```


# Logout
**DELETE /api/v1/logout**
Requires authentication header.
Response:
```{
"status": 200,
"message": "Logged out successfully."
}
```

#GET Providers
**/api/v1/providers**
Optional query parameters:

specialty: Filter by medical specialty (e.g., "Cardiology")
location: Filter by city or state

Response:
```
{
"data": [
{
"id": "1",
"type": "provider",
"attributes": {
"first_name": "Nathaniel",
"last_name": "Daight",
"specialty": "Cardiology",
"credentials": "MD",
"npi": "1234567890",
"email": "ndaight@example.com",
"phone": "555-123-4567",
"address_line1": "123 Main St",
"address_line2": "Suite 101",
"city": "San Mateo",
"state": "CA",
"zip": "94401",
"active": true
}
},
{
"id": "2",
"type": "provider",
"attributes": {
"first_name": "Fumi",
"last_name": "Yashi",
"specialty": "Dermatology",
"credentials": "RN",
"npi": "0987654321",
"email": "fyashi@example.com",
"phone": "555-987-6543",
"address_line1": "456 Oak Ave",
"city": "San Francisco",
"state": "CA",
"zip": "94102",
"active": true
}
}
]
}
```
######

#Get Provider Details

**GET /api/v1/providers/:id**

Response:
```
{
"data": {
"id": "1",
"type": "provider",
"attributes": {
"first_name": "Nathaniel",
"last_name": "Daight",
"specialty": "Cardiology",
"credentials": "MD",
"npi": "1234567890",
"email": "ndaight@example.com",
"phone": "555-123-4567",
"address_line1": "123 Main St",
"address_line2": "Suite 101",
"city": "San Mateo",
"state": "CA",
"zip": "94401",
"active": true
}
}
}
```

######
#Create Provider

**POST /api/v1/providers**

Response:
```
{
"provider": {
"first_name": "Jane",
"last_name": "Smith",
"specialty": "Neurology",
"credentials": "MD",
"npi": "2468013579",
"email": "jsmith@example.com",
"phone": "555-246-8013",
"address_line1": "789 Pine Blvd",
"address_line2": "Unit 303",
"city": "Oakland",
"state": "CA",
"zip": "94612"
}
}
```
######
#Update Provider

**PATCH/PUT /api/v1/providers/:id**

Response:

```
{
"provider": {
"first_name": "Jane",
"last_name": "Smith-Johnson",
"specialty": "Neurology",
"credentials": "MD, PhD",
"phone": "555-246-8013",
"address_line1": "789 Pine Blvd",
"address_line2": "Suite 505",
"city": "Oakland",
"state": "CA",
"zip": "94612"
}
}
```
######

#Deactivate Provider (Soft Delete)

**DELETE /api/v1/providers/:id**

Response:

```
{
"message": "Provider deactivated successfully"
}
```

"Known Trade-offs"
Deployment: The application is currently configured to run locally rather than being deployed to a cloud provider (AWS, Heroku, etc.).

Limited Testing: While basic unit tests were implemented for the API endpoints, end-to-end testing, comprehensive security testing, and performance testing were not implemented.

Basic Search & Filtering: The provider search and filtering functionality is implemented with simple pattern matching rather than more sophisticated search algorithms or dedicated search services.

No Image Upload: The current implementation doesn't support profile images for providers.

No Pagination: The provider list displays all providers without pagination, which could impact performance with a large dataset.

Basic Error Handling: The error handling in the frontend could be more robust with more specific error messages and recovery strategies.

Console Logs in Production: Some console.log statements remain in the production code, which is not ideal for a production environment.

Limited Security Hardening: While basic JWT authentication is implemented, additional security measures like rate limiting, CSRF protection, and more comprehensive authorization were not implemented due to time constraints