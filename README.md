# How to use this template

#### 1. Create a new repository from this template

#### 2. Clone the repository

#### 3. Install dependencies
`npm install`

#### 4. Update your project info
Open your `package.json` and update the following fields
```json
{
  "name": "<my-repo-name>",
  "homepage": "https://github.com/rdrg-ferreira/<my-repo-name>/",
  "repository": {
      "url": "git+https://github.com/rdrg-ferreira/<my-repo-name>.git"
  },
  "bugs": {
      "url": "https://github.com/rdrg-ferreira/<my-repo-name>/issues"
  },
}
```
Follow this by doing `npm update`

#### 5. Create a .env at the root directory and add SESSION_SECRET
Use [this](https://randomkeygen.com/secret-key) website to generate a secret

#### 6. Setup your database
Open `psql` and in it do:

```
CREATE DATABASE <db_name>;
\c <db_name>
```

Create the following env var in `.env`:
`DATABASE_URL="postgresql://username:password@localhost:5432/db_name?schema=public"`

Replace the placeholders with your actual database credentials:

- username: Your PostgreSQL username
- password: Your PostgreSQL password
- localhost:5432: Your PostgreSQL host and port
- db_name: Your database name

Define the data model in prisma/schema.prisma by adding all the tables fields and relations I might need

When it looks good, migrate the db (updates the db tables based on the schema):

`npx prisma migrate dev --name init` (init is the name of the migration, change it for the next ones)

Then generate the Prisma Client:

`npx prisma generate`

Use `node ./db/populateTables.js` to put dummy data in dev db to test features (there is some stuff there already to not forget syntax)

We can use `npx prisma studio --config ./prisma.config.js` to explore the db

Reference [CRUD](https://www.prisma.io/docs/orm/prisma-client/queries/crud) Prisma operations
Reference [Raw queries](https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries) using Prisma
Reference [Migration using branches](https://www.prisma.io/docs/guides/database/data-migration)
Reference [TypedSQL](https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/typedsql) (Idk if this is worth looking into)

#### 7. Deploy
When deploying, at least on Render, do:
- Create prod db
- Add `PROD_DB_URL` and `USE_PROD_DB="True"`(set to false to use dev db) to env file and run db/createTables (and populateTables) to create the tables of prod db
- Create web service and check this settings:
    - root dir: .
    - build command: npm install
    - start command: node app.js
- add all env variables
- Add PROD_DB_INTERNAL_URL to env variables (find it in prod db settings)