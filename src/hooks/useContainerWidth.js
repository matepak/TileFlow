import { useState, useEffect } from 'react';

const useContainerWidth = (containerRef, containerPadding) => {
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                setContainerWidth(entry.contentRect.width - (containerPadding * 2));
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [containerRef, containerPadding]);

    return containerWidth;
};

export default useContainerWidth; 