1.Build and start the services:
   ```sh
   docker compose up --build
   ```

2. Access the applications:
   - Rails API: http://localhost:3000
   - React UI: http://localhost:8080
  
3. It will load the provider catalog log in page -http://localhost:8080/login
4. We can create admin to log in using curl -curl -X POST http://localhost:3000/api/v1/register -H "Content-Type: application/json" -d '{"user": {"email":"admin@example.com", "password": "password123", "password_confirmation": "password123"}}’
5. If for some reason ot doesnt seed or create db migration -docker-compose exec api ./bin/rails db:create db:migrate db:seed
6. once you login with admin, you see some providers info.
7. We can perform all CRUD operations on health care provider info.



