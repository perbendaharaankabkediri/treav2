import TreaCard from '@/components/ui/TreaCard';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ status }) {
    return (
        <>
            <Head title="Profile" />

            <TreaPage size="medium" spacing="lg">
                <TreaPageHeader title="Pengaturan Profil" subtitle="Kelola informasi akun, kata sandi, dan keamanan profil Anda." />
                <TreaCard variant="form" padding="lg">
                    <UpdateProfileInformationForm status={status} className="max-w-xl" />
                </TreaCard>

                <TreaCard variant="form" padding="lg">
                    <UpdatePasswordForm className="max-w-xl" />
                </TreaCard>

                <TreaCard variant="form" padding="lg" tone="danger">
                    <DeleteUserForm className="max-w-xl" />
                </TreaCard>
            </TreaPage>
        </>
    );
}
