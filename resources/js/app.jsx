import TreaNavigationProgress from '@/components/ui/TreaNavigationProgress';
import { TreaToastProvider } from '@/components/ui/TreaToast';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { PrimeReactProvider } from 'primereact/api';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const pages = import.meta.glob('./Pages/**/*.jsx');
const pagesWithoutAuthenticatedLayout = ['Auth/', 'Errors/', 'Welcome'];

createInertiaApp({
    title: (title) => `${title} - ${appName}`,

    resolve: async (name) => {
        const page = await resolvePageComponent(`./Pages/${name}.jsx`, pages);
        const usesAuthenticatedLayout = !pagesWithoutAuthenticatedLayout.some((prefix) => name.startsWith(prefix));

        if (usesAuthenticatedLayout) {
            page.default.layout = (content) => <AuthenticatedLayout>{content}</AuthenticatedLayout>;
        }

        return page;
    },

    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <PrimeReactProvider value={{ ripple: true }}>
                <TreaToastProvider>
                    <TreaNavigationProgress />
                    <App {...props} />
                </TreaToastProvider>
            </PrimeReactProvider>,
        );
    },

    progress: false,
});
