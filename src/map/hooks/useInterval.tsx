import { useRef, useEffect } from 'react';

type UseIntervalOptions = Partial<{
    runOnStart: boolean,
    additionalDeps: any[],
}>

function useInterval(callback: () => void, delay: number | null, options?: UseIntervalOptions) {
    const savedCallback = useRef<() => void | null>();

    const deps = [delay];
    if (options && options.additionalDeps) {
        deps.push(...options.additionalDeps);
    }

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    });

    // Set up the interval.
    useEffect(() => {
        function tick() {
            if (savedCallback && typeof savedCallback.current !== 'undefined') {
                savedCallback.current();
            }
        }

        if (options && options.runOnStart) {
            tick();
        }

        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, deps);
}
export default useInterval;
