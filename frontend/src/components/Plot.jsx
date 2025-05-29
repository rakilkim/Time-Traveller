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

    const [time, setTime] = useState([]);
    const [priceClose, setPriceClose] = useState([]);
    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch(`http://localhost:8000/detail/price_close/${ticker}/hour/2025-04-10T08:30:00/2025-05-27T08:30:00`);

                if (!res.ok) {
                    throw new Error(`Server error ${res.status}`);
                }
                const data = await res.json();
                console.log(data);
                // change timestamp format from ISO-8601 date-time to unix-epoch timestamp
                const unix_epoch_time_close = data.time_close.map(time => Math.floor((new Date(time + "Z").getTime() / 1000)));

                setTime(unix_epoch_time_close);
                setPriceClose(data.price_close);
            } catch (error) {
                console.error(error);
            }
        }
        loadData();
    }, [ticker]);

    const data = [time, priceClose]

    const options = useMemo(
        () => ({
            title: ticker,
            width: width || 400,
            height: Math.round(width * 7 / 16),
            scales: {
                x: {
                },
                y: {
                },
            },
            axes: [
                {

                },

            ],
            series: [
                {
                    label: "Date",
                },
                {
                    show: true,

                    spanGaps: false,

                    label: "Price",
                    value: (self, rawValue) => rawValue == null ? '' : "$" + rawValue.toFixed(2),

                    stroke: "red",
                    width: 2,
                },
            ],
        }),
        [width, height, ticker]
    );

    return (
        // created ref object for the plot to track resizes
        <div ref={wrapRef} className='w-full py-3 border-b border-dashed'>
            <UplotReact
                data={data}
                options={options}
                onCreate={(chart) => { }}
                onDelete={(chart) => { }}
            />
        </div>
    );
}
