import TreaFlashToast from '@/components/ui/TreaFlashToast';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen font-sans antialiased">
            <TreaFlashToast />
            {children}
        </div>
    );
}
