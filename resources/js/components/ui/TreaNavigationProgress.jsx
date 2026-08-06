import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const PAGE_FADE_MS = 140;
const COMPLETE_MS = 180;
const SHOW_DELAY_MS = 160;

export default function TreaNavigationProgress() {
    const [visible, setVisible] = useState(false);
    const [percentage, setPercentage] = useState(0);
    const activeVisit = useRef(null);
    const sequence = useRef(0);
    const hasShown = useRef(false);
    const showTimer = useRef(null);
    const completeTimer = useRef(null);
    const trickleTimer = useRef(null);

    useEffect(() => {
        const clearTimers = () => {
            window.clearTimeout(showTimer.current);
            window.clearTimeout(completeTimer.current);
            window.clearInterval(trickleTimer.current);
        };

        const removeStartListener = router.on('start', (event) => {
            if (event.detail.visit.showProgress === false) return;

            sequence.current += 1;
            activeVisit.current = event.detail.visit;
            clearTimers();
            setPercentage(8);

            if (!hasShown.current) {
                showTimer.current = window.setTimeout(() => {
                    hasShown.current = true;
                    setVisible(true);
                }, SHOW_DELAY_MS);
            }

            trickleTimer.current = window.setInterval(() => {
                setPercentage((current) =>
                    Math.min(90, current + Math.max(1, (90 - current) * 0.08)),
                );
            }, 180);
        });

        const removeProgressListener = router.on('progress', (event) => {
            const uploaded = event.detail.progress?.percentage;

            if (uploaded) {
                setPercentage(Math.min(90, Math.max(8, uploaded * 0.9)));
            }
        });

        const removeFinishListener = router.on('finish', (event) => {
            if (event.detail.visit !== activeVisit.current) return;

            const currentSequence = sequence.current;
            activeVisit.current = null;

            window.clearTimeout(showTimer.current);
            window.clearInterval(trickleTimer.current);

            if (!event.detail.visit.completed) {
                hasShown.current = false;
                setVisible(false);
                setPercentage(0);
                return;
            }

            // Visits that finish before the threshold never need visual
            // feedback; completing them to 100% would reintroduce a flash.
            if (!hasShown.current) {
                setPercentage(0);
                return;
            }

            // Two animation frames ensure React has committed and the browser
            // has painted the new page before waiting for its fade transition.
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    const reduceMotion = window.matchMedia(
                        '(prefers-reduced-motion: reduce)',
                    ).matches;

                    completeTimer.current = window.setTimeout(
                        () => {
                            if (currentSequence !== sequence.current) return;

                            setPercentage(100);
                            completeTimer.current = window.setTimeout(() => {
                                if (currentSequence !== sequence.current) return;

                                hasShown.current = false;
                                setVisible(false);
                                setPercentage(0);
                            }, COMPLETE_MS);
                        },
                        reduceMotion ? 0 : PAGE_FADE_MS,
                    );
                });
            });
        });

        return () => {
            clearTimers();
            activeVisit.current = null;
            hasShown.current = false;
            removeStartListener();
            removeProgressListener();
            removeFinishListener();
        };
    }, []);

    return (
        <div
            className={[
                'trea-navigation-progress',
                visible ? 'visible' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            role="status"
            aria-live="polite"
            aria-hidden={!visible}
        >
            <div
                className="trea-navigation-progress-bar"
                style={{ width: `${percentage}%` }}
                aria-hidden="true"
            />
            <span className="sr-only">{percentage === 100 ? 'Halaman selesai dimuat.' : 'Memuat halaman...'}</span>
        </div>
    );
}
