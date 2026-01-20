This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

1. Clone the Repository

First, you need to clone the project repository from GitHub to your local machine. Open your terminal and run:

```bash
git clone https://github.com/manishkharthik/platform-one
```

This will create a local copy of the repository on your machine.

2. Install Dependencies
   
After cloning the repository, navigate into the project directory and install all required dependencies. Run the following commands:

```bash
cd platform-one
npm install
```

3. Generate Prisma Client
   
Prisma is used to interact with the database. You need to generate the Prisma client using the following command:

```bash
npx prisma generate 
```

This will generate the Prisma client, which is responsible for interacting with the database.

4. Pull Database Schema
   
Next, you need to sync your local Prisma schema with the database schema to ensure everything is up to date. Run:

```bash
npx prisma db pull
```

This will pull the schema from the database and update your Prisma schema file.

5. Seed the Database
   
To populate tables with initial values, you can seed the database by running:

```bash
npx prisma db seed
```

Test users (all use password: 123456):
   Participant: walter@participant.com / 123456 (Walter Sullivan - GOLD)
   Participant: sarah@participant.com / 123456 (Sarah Johnson - SILVER)
   Volunteer: mike@volunteer.com / 123456 (Mike Chen - PLATINUM)
   Volunteer: lisa@volunteer.com / 123456 (Lisa Wong - GOLD)
   Staff: admin@staff.com / 123456 (Admin User - PLATINUM)

6. Run the Development Server
   
Finally, you can run the development server to start the project and view it in your browser. Run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
