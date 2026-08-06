import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useAsyncAction from '../useAsyncAction';

const deferred = () => {
    let resolve;
    let reject;
    const promise = new Promise((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
};

describe('useAsyncAction', () => {
    it('menolak eksekusi ganda dan selalu memulihkan loading', async () => {
        const task = deferred();
        const operation = vi.fn(() => task.promise);
        const { result } = renderHook(() => useAsyncAction());

        let firstRun;
        let secondResult;
        act(() => {
            firstRun = result.current.run(operation);
            result.current.run(operation).then((value) => {
                secondResult = value;
            });
        });

        expect(result.current.loading).toBe(true);
        expect(operation).toHaveBeenCalledTimes(1);

        await act(async () => {
            task.resolve('selesai');
            await firstRun;
        });

        expect(secondResult).toBeNull();
        expect(result.current.loading).toBe(false);
    });

    it('menyimpan error, melemparkannya kembali, dan dapat mereset error', async () => {
        const failure = new Error('gagal');
        const { result } = renderHook(() => useAsyncAction());
        let thrownError;

        await act(async () => {
            try {
                await result.current.run(() => Promise.reject(failure));
            } catch (error) {
                thrownError = error;
            }
        });

        expect(thrownError).toBe(failure);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(failure);

        act(() => result.current.resetError());
        expect(result.current.error).toBeNull();
    });
});
