import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTreaToast } from './TreaToast';

export default function TreaFlashToast() {
    const { flash = {} } = usePage().props;
    const toast = useTreaToast();

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.error, flash?.success, toast]);

    return null;
}
