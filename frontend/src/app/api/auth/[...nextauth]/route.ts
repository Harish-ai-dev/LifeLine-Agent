import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DEMO_USERS } from '../../../../data/mockDashboardData';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.username) return null;
        
        // Find user by matching email/username (case-insensitive)
        const user = DEMO_USERS.find(
          (u) => 
            u.username.toLowerCase() === credentials.username.toLowerCase() && 
            (!credentials.role || u.role === credentials.role)
        );

        if (user) {
          return {
            id: user.id,
            name: user.username,
            email: user.username,
            role: user.role,
            facility_id: user.facility_id,
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.facility_id = (user as any).facility_id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
        (session.user as any).facility_id = token.facility_id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'secret_for_demo_purposes_only'
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
