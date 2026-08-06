import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from '../Pages/Dashboard';

describe('Dashboard ProgressBar', () => {
    it('menyediakan nilai progress determinate yang valid', () => {
        render(<ProgressBar value={42.4} />);
        const progress = screen.getByRole('progressbar', { name: 'Progress penyelesaian ICSA' });

        expect(progress).toHaveAttribute('aria-valuemin', '0');
        expect(progress).toHaveAttribute('aria-valuemax', '100');
        expect(progress).toHaveAttribute('aria-valuenow', '42');
        expect(progress).toHaveAttribute('aria-valuetext', '42 persen selesai');
    });

    it.each([
        ['nilai invalid', 'bukan-angka', '0'],
        ['nilai terlalu besar', 180, '100'],
        ['nilai negatif', -20, '0'],
    ])('menormalisasi %s', (_label, value, expected) => {
        render(<ProgressBar value={value} />);
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', expected);
    });
});
