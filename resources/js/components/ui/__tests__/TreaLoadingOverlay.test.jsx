import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import TreaLoadingOverlay from '../TreaLoadingOverlay';

describe('TreaLoadingOverlay', () => {
    afterEach(() => document.getElementById('app')?.remove());

    it('mengisolasi aplikasi, mengelola fokus, dan memulihkannya saat selesai', () => {
        const app = document.createElement('div');
        app.id = 'app';
        document.body.appendChild(app);
        const trigger = document.createElement('button');
        app.appendChild(trigger);
        trigger.focus();

        const { rerender } = render(<TreaLoadingOverlay open title="Memproses rekonsiliasi" description="Mohon tunggu." />);
        const overlay = screen.getByRole('alertdialog');

        expect(overlay).toHaveAttribute('aria-modal', 'true');
        expect(overlay).toHaveFocus();
        expect(app.inert).toBe(true);
        expect(app).toHaveAttribute('aria-hidden', 'true');
        expect(document.body.style.overflow).toBe('hidden');

        rerender(<TreaLoadingOverlay open={false} />);

        expect(app.inert).toBe(false);
        expect(app).not.toHaveAttribute('aria-hidden');
        expect(trigger).toHaveFocus();
        expect(document.body.style.overflow).toBe('');
    });
});
