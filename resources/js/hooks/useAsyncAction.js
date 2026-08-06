import { useCallback, useEffect, useRef, useState } from 'react';

export default function useAsyncAction() {
    const mounted = useRef(true);
    const running = useRef(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const resetError = useCallback(() => setError(null), []);

    const run = useCallback(async (operation) => {
        if (running.current) return null;

        running.current = true;
        if (mounted.current) {
            setLoading(true);
            setError(null);
        }

        try {
            return await operation();
        } catch (caughtError) {
            if (mounted.current) setError(caughtError);
            throw caughtError;
        } finally {
            running.current = false;
            if (mounted.current) setLoading(false);
        }
    }, []);

    return { loading, error, run, resetError };
}
