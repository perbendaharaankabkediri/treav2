import { Toast } from 'primereact/toast';
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
} from 'react';

const TreaToastContext = createContext(null);

const severityMap = {
    success: 'success',
    info: 'info',
    warning: 'warn',
    danger: 'error',
    error: 'error',
};

const defaultSummary = {
    success: 'Berhasil',
    info: 'Informasi',
    warning: 'Perhatian',
    danger: 'Terjadi Kesalahan',
    error: 'Terjadi Kesalahan',
};

export function TreaToastProvider({
    children,
    position = 'top-right',
    defaultLife = 4000,
}) {
    const toastRef = useRef(null);

    const show = useCallback(
        ({
            tone = 'info',
            title,
            message,
            detail,
            life = defaultLife,
            sticky = false,
            ...options
        }) => {
            toastRef.current?.show({
                severity: severityMap[tone] || severityMap.info,
                summary: title || defaultSummary[tone] || defaultSummary.info,
                detail: message ?? detail,
                life,
                sticky,
                ...options,
            });
        },
        [defaultLife],
    );

    const api = useMemo(
        () => ({
            show,
            success: (message, options = {}) =>
                show({ tone: 'success', message, ...options }),
            info: (message, options = {}) =>
                show({ tone: 'info', message, ...options }),
            warning: (message, options = {}) =>
                show({ tone: 'warning', message, ...options }),
            danger: (message, options = {}) =>
                show({ tone: 'danger', message, ...options }),
            error: (message, options = {}) =>
                show({ tone: 'danger', message, ...options }),
            clear: () => toastRef.current?.clear(),
        }),
        [show],
    );

    return (
        <TreaToastContext.Provider value={api}>
            {children}
            <Toast
                ref={toastRef}
                position={position}
                className="trea-toast"
            />
        </TreaToastContext.Provider>
    );
}

export function useTreaToast() {
    const context = useContext(TreaToastContext);

    if (!context) {
        throw new Error(
            'useTreaToast harus digunakan di dalam TreaToastProvider.',
        );
    }

    return context;
}

export default TreaToastProvider;
