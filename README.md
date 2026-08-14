# File Uploader

A bare-bones Google Drive app built with [Express.js][express-url], [PostgreSQL][postgresql-url] and [Supabase][supabase-url].

![Items Page](./screenshots/main.png)

## Overview

This app provides users a cloud storage system, allowing them to store any file they want. These files can be organized by using folders, and are stored in a [Supabase][supabase-url] bucket, meaning they can be downloaded later on. This app also uses [Prisma ORM][prisma-url] to communicate with the database, the [Multer middleware][multer-url] to process inputed files and [Passport.js][passport-url] to handle user authentication.

### Built With

[![Express][express-shield]][express-url] &nbsp; 
[![EJS][ejs-shield]][ejs-url] &nbsp; 
[![PostgreSQL][postgresql-shield]][postgresql-url] &nbsp; 
[![Supabase][supabase-shield]][supabase-url] &nbsp; 
[![Prisma][prisma-shield]][prisma-url] &nbsp; 

## Getting Started
Follow these steps to get a local copy of the project up and running.

### Prerequisites
* [NodeJs & npm][node-npm-install-guide] (Node v22.x or higher & npm v10.x or higher)
* [psql][psql-install-guide]
* [Supabase account][supabase-url] (Then create a new project, go to Storage and create a bucket named "files")

### Installation
1. Clone the repo
    ```sh
    git clone https://github.com/rdrg-ferreira/file-uploader
    ```
2. Install packages
   ```sh
   npm install
   ```
3. (Optional) Change git remote url to avoid accidental pushes to base project
   ```sh
   git remote set-url origin github_username/repo_name
   git remote -v # confirm the changes
   ```
4. Create an `.env` file and add this (replace the uppercase names with your own info)
    ```text
    SESSION_SECRET=YOUR_SESSION_SECRET_KEY
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    SUPABASE_URL=GET_THIS_FROM_THE_PROJECT_PAGE
    SUPABASE_KEY=GET_THIS_FROM_PROJECT_SETTINGS_THEN_API_KEYS_THEN_SERVICE_ROLE_KEY
    ```
5. Create a local database with the Prisma schema
    ```sh
    npx prisma db push
    ```
6. Start the server
    ```sh
    npm run dev
    ```

<!-- links and images -->
[express-url]: https://expressjs.com
[ejs-url]: https://ejs.co
[postgresql-url]: https://www.postgresql.org
[node-npm-install-guide]: https://nodejs.org/en/download
[psql-install-guide]: https://www.postgresql.org/download/
[supabase-url]: https://supabase.com
[prisma-url]: https://www.prisma.io
[multer-url]: https://expressjs.com/en/resources/middleware/multer/
[passport-url]: https://www.passportjs.org
<!-- shields -->
[express-shield]: https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=fff
[ejs-shield]: https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logo=ejs&logoColor=fff
[postgresql-shield]: https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white
[supabase-shield]: https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=fff
[prisma-shield]: https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=fff