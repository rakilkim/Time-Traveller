import UplotReact from "uplot-react";
import 'uplot/dist/uPlot.min.css';
import uPlot from 'uplot';
import { useMemo, useRef, useState, useEffect } from "react";

function useElementSize(initialHeight = 200) {
    const ref = useRef(null);
    const [size, setSize] = useState({ width: 0, height: initialHeight });

    useEffect(() => {
        if (!ref.current) return;

        const obs = new ResizeObserver(([entry]) => {  // observes changes made to the plot
            const { width } = entry.contentRect;
            setSize((s) => ({ width: Math.round(width), height: s.height }));
        });

        obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return [ref, size];
}

// can cut the graph by dragging the portion you want to see, double click to undo
export default function Plot({ ticker }) {
    const [wrapRef, { width, height }] = useElementSize(200);

    const fromTs = 1704967200;
    const stepTs = 15;
    const numSteps = 50;

    const xVals = Array.from({ length: numSteps }, (v, i) => fromTs + stepTs * i);
    const yVals = Array.from({ length: numSteps }, (v, i) => Math.random() * 100);
    const yVals2 = Array.from({ length: numSteps }, (v, i) => Math.random() * 100);

    const [time, setTime] = useState([]);
    const [priceClose, setPriceClose] = useState([]);
    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch(`http://localhost:8000/detail/price_close/${ticker}/hour/2025-05-25`);

                if (!res.ok) {
                    throw new Error(`Server error ${res.status}`);
                }
                const data = await res.json();
                console.log(data);

                setTime(data.time_close);
                setPriceClose([data.price_close]);
            } catch (error) {
                console.error(error);
            }
        }
        loadData();
    }, [tickers]);

    // turn time into uplot time using tz or ts or whatever
    const data = useMemo(() => [time, ...priceClose], []);
    const series = useMemo(() => [
        {},
        {
            show: true,

            spanGaps: false,

            label: tickers[0],
            value: (self, rawValue) => rawValue == null ? '' : "*" + rawValue.toFixed(2),

            stroke: "red",
            width: 2,
        },
        {
            show: true,

            spanGaps: false,

            label: tickers[1],
            value: (self, rawValue) => rawValue == null ? '' : "*" + rawValue.toFixed(2),

            stroke: "blue",
            width: 2,
        },], []);

    const options = useMemo(
        () => ({
            width: width || 400,
            height: Math.round(width * 7 / 16),
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
            series: series,
        }),
        [width, height, tickers]
    );

    return (
        // created ref object for the plot to track resizes
        <div ref={wrapRef} className='w-full'>
            {tickers.length && <UplotReact
                data={data}
                options={options}
                onCreate={(chart) => { }}
                onDelete={(chart) => { }}
            />}
        </div>
    );
}
