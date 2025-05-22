import UplotReact from "uplot-react";
import 'uplot/dist/uPlot.min.css';
import uPlot from 'uplot';
import { useMemo, useRef, useState, useEffect } from "react";

function useElementSize(initialHeight = 200) {
    const ref = useRef(null);
    const [size, setSize] = useState({ width: 0, height: initialHeight });

    useEffect(() => {
        if (!ref.current) return;

        const obs = new ResizeObserver(([entry]) => {
            const { width } = entry.contentRect;
            setSize((s) => ({width: Math.round(width), height: s.height }));
        });

        obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return [ref, size];
}

// can cut the graph by dragging the portion you want to see, double click to undo
export default function Plot({ symbols }) {
    const [wrapRef, { width, height }] = useElementSize(200);

    const fromTs = 1704967200;
    const stepTs = 15;
    const numSteps = 50;

    const xVals = Array.from({ length: numSteps }, (v, i) => fromTs + stepTs * i);
    const yVals = Array.from({ length: numSteps }, (v, i) => Math.random() * 100);


    const data = useMemo(() => [
        xVals,
        yVals,], []);

    const options = useMemo(
        () => ({
            width: width || 400,
            height: Math.round(width * 7/16),
            scales: {
                x: {
                    time: true,
                },
                y: {
                    range: [0, 100]
                },
            },
            axes: [
                {

                },

            ],
            series: [
                {},
                {
                    show: true,

                    spanGaps: false,

                    label: "Price",
                    value: (self, rawValue) => rawValue == null ? '' : "*" + rawValue.toFixed(2),

                    stroke: "red",
                    width: 2,
                },
            ],
        }),
        [width, height, symbols]
    );

    return (
        <div ref={wrapRef} className='w-full'>
            {symbols.length && <UplotReact
                data={data}
                options={options}
                onCreate={(chart) => { }}
                onDelete={(chart) => { }}
            />}
        </div>
    );
}
