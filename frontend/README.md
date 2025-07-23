# DevProposals Frontend

A React application with authentication pages and landing page.

## Project Structure

```
src/
├── pages/
│   ├── home/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── ProblemStatement.tsx
│   │   │   ├── SolutionOverview.tsx
│   │   │   ├── KeyFeatures.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Benefits.tsx
│   │   │   ├── SocialProof.tsx
│   │   │   ├── Security.tsx
│   │   │   ├── CTA.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── index.ts
│   │   └── Home.tsx
│   └── auth/
│       └── components/
│           ├── SignUp.tsx
│           ├── SignIn.tsx
│           └── index.ts
├── App.tsx
└── main.tsx
```

## Routes

- `/` - Home page with landing page content
- `/auth/signup` - Sign up page with Google authentication
- `/auth/signin` - Sign in page with Google authentication

## Features

### Authentication Pages
- **Sign Up Page**: Dark theme with Google sign-up, form fields for name, email, and phone number
- **Sign In Page**: Dark theme with Google sign-in, email/phone and password fields, remember me option

### Landing Page
- Complete landing page with all sections (Hero, Features, Benefits, etc.)
- Navigation header with links to auth pages
- Responsive design with Tailwind CSS

## Technologies Used

- React 19
- React Router DOM for navigation
- Tailwind CSS for styling
- Iconify for icons
- TypeScript for type safety

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Navigation

The application includes proper navigation between pages:
- Header buttons link to sign up and sign in pages
- Auth pages have links to switch between sign up and sign in
- Logo links back to home page
