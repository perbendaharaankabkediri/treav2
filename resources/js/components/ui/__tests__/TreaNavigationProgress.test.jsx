import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const listeners = new Map();

vi.mock('@inertiajs/react', () => ({
    router: {
        on: vi.fn((event, callback) => {
            listeners.set(event, callback);
            return () => listeners.delete(event);
        }),
    },
}));

import TreaNavigationProgress from '../TreaNavigationProgress';

const emit = (event, detail) => act(() => listeners.get(event)?.({ detail }));

describe('TreaNavigationProgress', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal('requestAnimationFrame', (callback) => window.setTimeout(callback, 0));
        vi.stubGlobal('matchMedia', () => ({ matches: false }));
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        listeners.clear();
    });

    it('tidak berkedip untuk visit yang selesai sebelum ambang tampil', () => {
        const { container } = render(<TreaNavigationProgress />);
        const visit = { showProgress: true, completed: true };

        emit('start', { visit });
        act(() => vi.advanceTimersByTime(100));
        emit('finish', { visit });
        act(() => vi.runAllTimers());

        expect(container.firstChild).not.toHaveClass('visible');
        expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    });

    it('menampilkan status aksesibel dan menyelesaikan visit lambat', () => {
        const { container } = render(<TreaNavigationProgress />);
        const visit = { showProgress: true, completed: true };

        emit('start', { visit });
        act(() => vi.advanceTimersByTime(160));

        expect(container.firstChild).toHaveClass('visible');
        expect(screen.getByRole('status')).toHaveTextContent('Memuat halaman');

        emit('finish', { visit });
        act(() => vi.advanceTimersByTime(142));
        expect(screen.getByRole('status')).toHaveTextContent('Halaman selesai dimuat');
        act(() => vi.advanceTimersByTime(180));
        expect(container.firstChild).not.toHaveClass('visible');
    });

    it('langsung menyembunyikan visit yang dibatalkan', () => {
        const { container } = render(<TreaNavigationProgress />);
        const visit = { showProgress: true, completed: false };

        emit('start', { visit });
        act(() => vi.advanceTimersByTime(160));
        emit('finish', { visit });

        expect(container.firstChild).not.toHaveClass('visible');
        expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    });

    it('mengabaikan finish visit lama ketika visit baru masih aktif', () => {
        const { container } = render(<TreaNavigationProgress />);
        const firstVisit = { showProgress: true, completed: true };
        const secondVisit = { showProgress: true, completed: true };

        emit('start', { visit: firstVisit });
        act(() => vi.advanceTimersByTime(160));
        emit('start', { visit: secondVisit });
        emit('finish', { visit: firstVisit });

        expect(container.firstChild).toHaveClass('visible');

        emit('finish', { visit: secondVisit });
        act(() => vi.runAllTimers());
        expect(container.firstChild).not.toHaveClass('visible');
    });
});
