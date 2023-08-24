import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Nyarlathotep',
    description: 'A Secure chat application',
    verification: {
        google: 'hgtdHl6GDpYmoYXqHGa4k5W7iJYWQOh5QZ8tw9oGiyQ',
    }
};

export default function RootLayout({ children, }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    )
}
