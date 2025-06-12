import UplotReact from "uplot-react";
import "uplot/dist/uPlot.min.css";
import uPlot from "uplot";
import { useMemo, useRef, useState, useEffect } from "react";
import Spinner from "./Spinner.jsx";
import init, { add } from "../../public/wasm/add_two_numbers.js";

// WASM Module Requirement
(async () => {
  try {
    await init();
    console.log("[WASM] Rust initialized");

    const result = add(1, 1);
    console.log("[WASM] 1 + 1 =", result);
  } catch (e) {
    console.error("[WASM] Rust failed to initialize", e);
  }
})();

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
export default function Plot({ ticker, onRemove, tickerError }) {
    const [found, setFound] = useState(false);
    const [plotLoading, setPlotLoading] = useState(true);
    const [wrapRef, { width, height }] = useElementSize(200);
    const [currInterval, setCurrInterval] = useState("day");
    const [currMethod, setCurrMethod] = useState("arima");

    const [historyLength, setHistoryLength] = useState("1M");
    const [time, setTime] = useState([]);
    const [priceClose, setPriceClose] = useState([]);
    const [plotData, setPlotData] = useState([[], []]);
    const initialSeries = [
        {
            label: "Date",
        },
        {
            show: true,

            spanGaps: false,

            label: "Price",
            value: (self, rawValue) => rawValue == null ? "" : "$" + rawValue.toFixed(2),

            stroke: "red",
            width: 2,
        },
    ];
    const [plotSeries, setPlotSeries] = useState(initialSeries);
    const [plotBands, setPlotBands] = useState([]);

    useEffect(() => {
        async function loadData() {
            try {
                setPlotLoading(true);

                const now = new Date();
                let nowISO = now.toISOString();
                const history = new Date(nowISO);
                switch (historyLength) {
                    case "1Y":
                        history.setFullYear(history.getFullYear() - 1);
                        break;
                    case "3M":
                        history.setMonth(history.getMonth() - 3);
                        break;
                    case "1M":
                        history.setMonth(history.getMonth() - 1);
                        break;
                    case "1W":
                        history.setDate(history.getDate() - 7);
                        break;
                    case "1D":
                        history.setDate(history.getDate() - 1);
                        break;
                }
                const historyISO = history.toISOString().slice(0, -5);
                nowISO = nowISO.slice(0, -5);
                const res = await fetch(`http://localhost:8000/detail/price_close/${ticker}/day/${historyISO}/${nowISO}`);
                if (!res.ok) {
                    throw new Error(`Server error ${res.status}`);
                }
                const data = await res.json();
                if (data.status === "NOT_FOUND") {
                    setFound(false);
                    onRemove(ticker);
                    tickerError();
                    return;
                }
                // change timestamp format from ISO-8601 date-time to unix-epoch timestamp
                const unix_epoch_time_close = data.time_close.map(time => Math.floor((new Date(time).getTime() / 1000)));
                setTime(unix_epoch_time_close);
                setPriceClose(data.price_close);
                setPlotData([unix_epoch_time_close, data.price_close]);
                setPlotSeries(initialSeries);
                setFound(true);
                setPlotLoading(false);
            } catch (error) {
                console.error(error);
            }
        }
        loadData();
    }, [ticker, historyLength]);

    const initialData = [time, priceClose];

    const options = useMemo(
        () => ({
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
            bands: plotBands,
        }),
        [width, height, ticker, plotSeries, plotBands]
    );

    async function handleSubmit(e) {
        e.preventDefault();
        setPlotData(initialData);
        setPlotSeries(initialSeries);
        setPlotBands([]);
        const formData = new FormData(e.target);
        const interval = formData.get("interval"); // will be used to get the requested interval from the data we get from the api
        const steps = Number(formData.get("steps"));
        const method = formData.get("method");
        try {
            setPlotLoading(true);

            const res = await fetch(`http://localhost:8000/forecast/${method}/${ticker}/${steps}`);
            if (!res.ok) {
                throw new Error(`Server error ${res.status}`);
            }
            const pred = await res.json();
            console.log(pred, Object.fromEntries(Object.entries(pred).filter(([key]) => key.includes(interval))));
            const predUpperbound = pred[interval + "_upperbound"];
            const predMean = pred[interval + "_mean"];
            const predLowerbound = pred[interval + "_lowerbound"];
            const predTime = pred[interval + "_time"].map(time => Math.floor((new Date(time).getTime() / 1000)));
            setPlotData(([oldTime, oldPrice]) => [[...oldTime, ...predTime],
            [...oldPrice, ...new Array(steps).fill(null)],
            [...new Array(oldTime.length).fill(null), ...predLowerbound],
            [...new Array(oldTime.length).fill(null), ...predUpperbound],
            [...new Array(oldTime.length).fill(null), ...predMean],
            ]);
            setPlotSeries(old => [
                ...old,
                {
                    show: true,
                    points: {
                        show: false,
                    },

                    spanGaps: false,

                    label: "Low",
                    value: (self, rawValue) => rawValue == null ? "" : "$" + rawValue.toFixed(2),

                    stroke: "green",
                    width: 1,
                },
                {
                    show: true,
                    points: {
                        show: false,
                    },

                    spanGaps: false,

                    label: "High",
                    value: (self, rawValue) => rawValue == null ? "" : "$" + rawValue.toFixed(2),

                    stroke: "orange",
                    width: 1,
                },
                {
                    show: true,

                    spanGaps: false,

                    label: "Predicted",
                    value: (self, rawValue) => rawValue == null ? "" : "$" + rawValue.toFixed(2),

                    stroke: "blue",
                    width: 2,
                },
            ]);
            setPlotBands([
                {
                    series: [3, 4], // show band top to bottom (serie 3 to serie 4)
                    fill: "rgba(255,100,0,0.2)",
                },
                {
                    series: [4, 2],
                    fill: "rgba(0,255,0,0.2)",
                },
            ]);
            setPlotLoading(false);
        } catch (error) {
            console.error(error);
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
        // create ref object for the plot to track resizes
        <div ref={wrapRef}
            role="img"
            aria-label="Line chart of a stock price"
            className="relative w-full py-3 border-b border-dashed">
            <div className="flex justify-between">
                <h2 className="text-lg lg:text-2xl font-bold ml-1 xs:ml-3">{ticker}</h2>
                <div className="flex gap-1 mr-1 xs:mr-3">
                    {["1Y", "3M", "1M", "1W"].map((length, i) => (
                        <button
                            key={i}
                            className={`cursor-pointer border rounded-md w-8
                            ${length === historyLength ? "bg-gray-300" : ""}
                            `}
                            onClick={() => setHistoryLength(length)}
                        >{length}</button>
                    ))}
                </div>
            </div>
            <UplotReact
                data={plotData}
                options={options}
                onCreate={(chart) => { }}
                onDelete={(chart) => { }}
            />
            {plotLoading ? (
                <Spinner message={"Attempting to fetch data..."} />
            ) : (
                <></>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col xs:justify-center xs:w-fit md:flex-row md:items-center">
                <fieldset disabled={!isDesktop} className="hidden xs:flex gap-4 ml-1 lg:ml-4 border rounded-sm px-1 pb-1">
                    <legend className="ml-2">Interval</legend>
                    {intervals.map((interval, i) => (
                        <label key={i}>
                            <input
                                type="radio"
                                name="interval"
                                value={interval.value}
                                checked={currInterval === interval.value}
                                onChange={(e) => setCurrInterval(e.target.value)}
                                required />
                            {interval.label}
                        </label>
                    ))}
                </fieldset>
                <fieldset disabled={!isDesktop} className="hidden xs:flex gap-4 ml-1 lg:ml-4 border rounded-sm px-1 pb-1">
                    <legend className="ml-2">Method</legend>
                    {methods.map((method, i) => (
                        <label key={i}>
                            <input
                                type="radio"
                                name="method"
                                value={method.value}
                                checked={currMethod === method.value}
                                onChange={(e) => setCurrMethod(e.target.value)}
                                required />
                            {method.label}
                        </label>
                    ))}
                </fieldset>
                {/* Below is when the screen is small */}
                <label
                    className="flex w-fit xs:hidden ml-2 lg:ml-4 border rounded-sm p-1 mb-2">
                    Interval:
                    <select
                        name="interval"
                        className="border rounded-sm ml-1"
                        value={currInterval}
                        onChange={(e) => setCurrInterval(e.target.value)}
                        disabled={isDesktop}
                    >
                        {intervals.map((interval, i) => (
                            <option key={i} value={interval.value}>{interval.label}</option>
                        ))}
                    </select>
                </label>
                <label
                    className="flex w-fit xs:hidden ml-2 lg:ml-4 border rounded-sm p-1 mb-1">
                    Method:
                    <select name="method"
                        className="border rounded-sm ml-1"
                        value={currMethod}
                        onChange={(e) => setCurrMethod(e.target.value)}
                        disabled={isDesktop}
                    >
                        {methods.map((method, i) => (
                            <option key={i} value={method.value}>{method.label}</option>
                        ))}
                    </select>
                </label>

                <label className="ml-2 lg:ml-4 mb-4 lg:mb-0">
                    <div># points</div>
                    <input type="number" name="steps" min="1" max="20" step="1" defaultValue={10}
                        className="border rounded-md w-14" />
                </label>
                <button type="submit"
                    className="cursor-pointer border rounded-md w-16 h-8 ml-2 lg:ml-4"
                >Predict</button>
            </form>
        </div>
    );
}