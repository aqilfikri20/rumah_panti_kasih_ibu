# PostgreSQL

The schema in `schema.sql` covers caregivers, children, health and growth records, daily notes, reminders, and kebutuhan inventory.

## Apply the schema

After you have the PostgreSQL host, database name, and username, apply it with `psql`:

```powershell
$env:PGPASSWORD = '<your-password>'
psql -h '<host>' -p 5432 -U '<username>' -d '<database>' -f database/schema.sql
Remove-Item Env:PGPASSWORD
```

Do not commit a real password to this repository. The password shared in chat should be rotated if it is used by any account beyond a disposable local development database.

## Application connection

The Vite/React frontend connects to PostgreSQL through the FastAPI backend in `../../backend-web-child`. Inventory catalog rows are initialized through the API and stock edits are saved in PostgreSQL; database credentials stay in the backend `.env` file and must never be placed in Vite variables or frontend code.
