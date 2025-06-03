import UplotReact from "uplot-react";
import 'uplot/dist/uPlot.min.css';
import uPlot from 'uplot';
import { useMemo, useRef, useState, useEffect } from "react";

const intervals = [
    { label: "Hourly", value: "hour" },
    { label: "Daily", value: "day" },
    { label: "Weekly", value: "week" },
    { label: "Monthly", value: "month" },
]
const methods = [
    { label: "ARIMA", value: "arima" },
    { label: "ETS", value: "ets" },
    { label: "Prophet", value: "prophet" },
    { label: "MAPA", value: "mapa" },
    { label: "Combination", value: "combination" },
]

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
export default function Plot({ ticker, onRemove }) {
    const [found, setFound] = useState(false);
    const [predLoading, setPredLoading] = useState(false);
    const [plotLoading, setPlotLoading] = useState(true);
    const [wrapRef, { width, height }] = useElementSize(200);

    const [time, setTime] = useState([]);
    const [priceClose, setPriceClose] = useState([]);
    const [plotData, setPlotData] = useState([[], []]);
    const [plotSeries, setPlotSeries] = useState([
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
    ])
    useEffect(() => {
        async function loadData() {
            try {
                setPlotLoading(true);

                const now = new Date();
                let nowISO = now.toISOString();
                const monthAgo = new Date(nowISO);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                const monthAgoISO = monthAgo.toISOString().slice(0, -5);
                nowISO = nowISO.slice(0, -5);
                const res = await fetch(`http://localhost:8000/detail/price_close/${ticker}/day/${monthAgoISO}/${nowISO}`);
                if (!res.ok) {
                    throw new Error(`Server error ${res.status}`);
                }
                const data = await res.json();
                console.log(data);
                if (data.status === "NOT_FOUND") {
                    setFound(false)
                    onRemove(ticker);
                    return;
                }
                // change timestamp format from ISO-8601 date-time to unix-epoch timestamp
                const unix_epoch_time_close = data.time_close.map(time => Math.floor((new Date(time + "Z").getTime() / 1000)));

                setTime(unix_epoch_time_close);
                setPriceClose(data.price_close);
                setPlotData([unix_epoch_time_close, data.price_close]);
                setFound(true);
            } catch (error) {
                console.error(error);
            } finally {
                setPlotLoading(false);
            }
        }
        loadData();
    }, [ticker]);

    const initialSeries = [
        {},
        {
            label: ticker,
            stroke: "red",
            width: 2,
            spanGaps: false,
            value: (_, v) => v == null ? "" : "$" + v.toFixed(2),
        },
    ];
    const initialData = [time, priceClose];

    const options = useMemo(
        () => ({
            title: ticker,
            width: width || 400,
            height: Math.round(width * 6 / 16),
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
            series: plotSeries,
        }),
        [width, height, ticker, plotSeries]
    );

    async function handleSubmit(e) {
        e.preventDefault();
        setPlotData(initialData);
        setPlotSeries(initialSeries);
        const formData = new FormData(e.target);
        const interval = formData.get("interval"); // will be used to get the requested interval from the data we get from the api
        const steps = Number(formData.get("steps"));
        const method = formData.get("method");
        try {
            setPredLoading(true);

            const res = await fetch(`http://localhost:8000/forecast/${method}/${ticker}/${steps}`);
            if (!res.ok) {
                throw new Error(`Server error ${res.status}`);
            }
            const pred = await res.json();
            console.log(pred, Object.fromEntries(Object.entries(pred).filter(([key]) => key.includes(interval))));
            // filter data by requested interval length
            //setPredictions(Object.fromEntries(Object.entries(pred).filter(([key]) => key.includes(interval))));
            const predMean = pred[interval + "_mean"];
            const predTime = pred[interval + "_time"].map(time => Math.floor((new Date(time + "Z").getTime() / 1000)));
            console.log(predMean, predTime);
            setPlotData(([oldTime, oldPrice]) => [[...oldTime, ...predTime], [...oldPrice, ...new Array(steps).fill(null)], [...new Array(oldTime.length).fill(null), ...predMean]]);
            setPlotSeries(old => [
                ...old,
                {
                    show: true,

                    spanGaps: false,

                    label: "Predicted",
                    value: (self, rawValue) => rawValue == null ? '' : "$" + rawValue.toFixed(2),

                    stroke: "blue",
                    width: 2,
                }
            ])
        } catch (error) {
            console.error(error);
        } finally {
            setPredLoading(false);
        }
    }

    // detect small screen sizes to disable unused form elements
    function useIsDesktop(breakpoint = "(min-width: 480px)") {
        const [isDesk, setDesk] = useState(() => window.matchMedia(breakpoint).matches);
        useEffect(() => {
            const mql = window.matchMedia(breakpoint);
            const handler = () => setDesk(mql.matches);
            mql.addEventListener("change", handler);
            return () => mql.removeEventListener("change", handler);
        }, [breakpoint]);
        return isDesk;
    }

    const isDesktop = useIsDesktop();

    if (!plotLoading && !found) {
        return null;
    }

    return (
        // created ref object for the plot to track resizes
        <div ref={wrapRef} className='relative w-full py-3 border-b border-dashed'>
            <UplotReact
                data={plotData}
                options={options}
                onCreate={(chart) => { }}
                onDelete={(chart) => { }}
            />
            {predLoading ? (
                <div
                    role="status"
                    aria-live="polite"
                    className="absolute top-1/3 left-1/2 flex items-center justify-center"
                >
                    <svg
                        className="animate-spin h-8 w-8 text-blue-600"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                    </svg>
                    <span className="sr-only">Loading…</span>
                </div>
            ) : (
                <></>
            )}
            {plotLoading ? (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed inset-0 flex justify-center items-center bg-black/5"
                >
                    <svg
                        className="animate-spin h-8 w-8 text-blue-600"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                    </svg>
                    <span className="sr-only">Loading…</span>
                </div>
            ) : (
                <></>
            )}
            <form onSubmit={handleSubmit} className='flex flex-col xs:justify-center xs:w-fit md:flex-row md:items-center'>
                <fieldset disabled={!isDesktop} className='hidden xs:flex gap-4 ml-1 lg:ml-4 border rounded-sm px-1 pb-1'>
                    <legend className='ml-2'>Interval</legend>
                    {intervals.map((interval, i) => (
                        <label key={i}>
                            <input type='radio' name='interval' value={interval.value} required />
                            {interval.label}
                        </label>
                    ))}
                </fieldset>
                <fieldset disabled={!isDesktop} className='hidden xs:flex gap-4 ml-1 lg:ml-4 border rounded-sm px-1 pb-1'>
                    <legend className='ml-2'>Method</legend>
                    {methods.map((method, i) => (
                        <label key={i}>
                            <input type='radio' name='method' value={method.value} required />
                            {method.label}
                        </label>
                    ))}
                </fieldset>
                {/* Below is when the screen is small */}
                <label
                    className='flex w-fit xs:hidden ml-2 lg:ml-4 border rounded-sm p-1 mb-2'>
                    Interval:
                    <select name='interval'
                        className='border rounded-sm ml-1'
                        disabled={isDesktop}
                        >
                        {intervals.map((interval, i) => (
                            <option key={i} value={interval.value}>{interval.label}</option>
                        ))}
                    </select>
                </label>
                <label
                    className='flex w-fit xs:hidden ml-2 lg:ml-4 border rounded-sm p-1 mb-1'>
                    Method:
                    <select name='method'
                        className='border rounded-sm ml-1'
                        disabled={isDesktop}
                        >
                        {methods.map((method, i) => (
                            <option key={i} value={method.value}>{method.label}</option>
                        ))}
                    </select>
                </label>

                <label className='ml-2 lg:ml-4 mb-4 lg:mb-0'>
                    <div># points</div>
                    <input type='number' name='steps' min='1' max='20' step='1' defaultValue={10}
                        className='border rounded-md w-14' />
                </label>
                <button type='submit'
                    className='cursor-pointer border rounded-md w-16 h-8 ml-2 lg:ml-4'
                >Predict</button>
            </form>
        </div>
    );
}
