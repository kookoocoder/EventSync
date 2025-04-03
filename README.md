# EventSync

A modern event management platform built with Next.js and shadcn/ui.

## Features

- User authentication (register/login)
- Admin dashboard for event management
- Event creation, editing, and deletion
- Live and upcoming events display
- Event registration system
- Responsive design with dark mode

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/eventsync.git
cd eventsync
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
- Copy `.env.example` to `.env`
- Update the variables with your values:
  - `DATABASE_URL`: Your PostgreSQL database URL
  - `NEXTAUTH_SECRET`: A random string for NextAuth.js
  - `NEXTAUTH_URL`: Your application URL

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Create an admin user:
```bash
npx prisma studio
```
- Open the Prisma Studio interface
- Create a new user with role "ADMIN"

6. Start the development server:
```bash
npm run dev
```

## Usage

1. Visit `http://localhost:3000` in your browser
2. Register a new account or login
3. Access the admin dashboard at `/admin` (admin users only)
4. Create and manage events through the admin dashboard
5. View and register for events on the main page

## Tech Stack

- Next.js 14
- TypeScript
- Prisma ORM
- PostgreSQL
- NextAuth.js
- shadcn/ui
- Tailwind CSS

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 