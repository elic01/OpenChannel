# OpenChannel

OpenChannel is an anonymous feedback system built with Next.js and Supabase, designed for organizations to collect honest employee feedback through secure, role-based access and multi-tenant architecture.

## Features

### Core Functionality
- **Anonymous Feedback Submission**: Employees can submit feedback without revealing their identity
- **Pulse Polls**: Quick surveys to gauge employee sentiment on specific topics
- **Role-Based Access Control**: Separate dashboards for admins, P&C admins, and employees
- **Multi-Tenant Architecture**: Organizations are isolated for secure data management

### Admin Features
- **Feedback Management**: Review, analyze, and respond to feedback submissions
- **User Management**: Invite new employees, manage roles, and handle terminations
- **Analytics Dashboard**: Insights into feedback trends and employee engagement
- **Billing & Subscription**: Manage organization subscriptions and billing
- **Poll Creation & Management**: Create and monitor pulse polls

### Employee Features
- **Feedback Dashboard**: Submit anonymous feedback and view past submissions
- **Poll Participation**: Respond to active pulse polls
- **Settings**: Manage personal account settings

### Technical Features
- **Real-time Updates**: Live feedback and poll status updates
- **USSD Integration**: Mobile feedback submission via USSD (for regions with limited internet)
- **AI-Powered Analysis**: Automated feedback categorization and sentiment analysis
- **Secure Authentication**: Supabase-based auth with Row Level Security (RLS)

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel
- **Additional Libraries**:
  - React Hook Form with Zod validation
  - Recharts for analytics
  - Date-fns for date handling
  - Lucide React for icons

## Getting Started

### Prerequisites
- Node.js (latest stable version)
- pnpm package manager
- Supabase account and project

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/elic01/OpenChannel.git
   cd OpenChannel
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   pnpm install
   \`\`\`

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Configure Supabase URL and keys
   - Add other required environment variables

4. Set up the database:
   - Follow the instructions in `DATABASE_SETUP.md`
   - Run the SQL scripts in Supabase SQL Editor

5. Start the development server:
   \`\`\`bash
   pnpm dev
   \`\`\`

### Database Setup

Refer to `DATABASE_SETUP.md` for detailed database initialization instructions. Key steps include:
- Running RLS policies setup
- Adding multi-tenant enhancements
- Creating secure profile management functions

## Usage

### For Employees
1. Sign up or log in via invitation
2. Access the dashboard to submit anonymous feedback
3. Participate in active pulse polls
4. View your submission history

### For Admins
1. Sign up as system admin to create an organization
2. Invite users and assign roles (pc_admin, employee)
3. Review feedback in the admin dashboard
4. Create and manage pulse polls
5. Monitor analytics and billing

## API Routes

- `/api/feedback/submit` - Submit anonymous feedback
- `/api/feedback/analyze` - AI-powered feedback analysis
- `/api/polls/respond` - Respond to pulse polls
- `/api/analytics/generate` - Generate analytics reports
- `/api/ussd/webhook` - Handle USSD feedback submissions

## Deployment

The project is configured for deployment on Vercel with automatic sync from v0.app.

Live deployment: [Vercel Link](https://vercel.com/lchinjex-gmailcoms-projects/v0-anonymous-feedback-system)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `pnpm lint`
5. Submit a pull request

## License

This project is private and proprietary.

## Support

For issues or questions, please open an issue in the GitHub repository.
