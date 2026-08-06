import forms from '@tailwindcss/forms';
import defaultTheme from 'tailwindcss/defaultTheme.js';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                trea: {
                    midnight: 'var(--trea-brand-midnight)',
                    navy: 'var(--trea-brand-navy)',
                    primary: 'var(--trea-primary)',
                    'primary-hover': 'var(--trea-primary-hover)',
                    ground: 'var(--trea-surface-ground)',
                    section: 'var(--trea-surface-section)',
                    card: 'var(--trea-surface-card)',
                    border: 'var(--trea-surface-border)',
                    text: 'var(--trea-text)',
                    heading: 'var(--trea-text-heading)',
                    muted: 'var(--trea-text-muted)',
                    success: 'var(--trea-success)',
                    'success-hover': 'var(--trea-success-hover)',
                    warning: 'var(--trea-warning)',
                    'warning-hover': 'var(--trea-warning-hover)',
                    danger: 'var(--trea-danger)',
                    'danger-hover': 'var(--trea-danger-hover)',
                    info: 'var(--trea-info)',
                    'info-hover': 'var(--trea-info-hover)',
                },
                finance: {
                    dark: '#0f172a',
                    sidebarText: '#94a3b8',
                    active: '#4f46e5',
                    primary: '#1e3a8a',
                    bg: '#f6f7fb',
                },
            },
            boxShadow: {
                'trea-card': 'var(--trea-shadow-card)',
                'trea-card-hover': 'var(--trea-shadow-card-hover)',
                'trea-overlay': 'var(--trea-shadow-overlay)',
            },
        },
    },

    plugins: [forms],
};
