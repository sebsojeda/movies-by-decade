import * as d3 from "d3";
import { useMemo } from "react";

function YAxis({ domain, range, label }: YAxisProps) {
  const ticks = useMemo(() => {
    const yScale = d3.scaleLinear().domain(domain).range(range);
    const height = range[1] - range[0];
    const pixelsPerTick = 30;
    const numberOfTicksTarget = Math.max(1, Math.floor(height / pixelsPerTick));

    return yScale
      .ticks(numberOfTicksTarget)
      .map((value) => ({ value, yOffset: yScale(value) }));
  }, [domain, range]);

  return (
    <svg height={range[1] + 10} width={57}>
      <path
        d={`M 50 ${range[0]} h 6 V ${range[1]} h -6`}
        fill="none"
        stroke="currentColor"
      />
      {ticks.map(({ value, yOffset }) => (
        <g key={value} transform={`translate(50, ${yOffset})`}>
          <text
            textAnchor="end"
            className="translate-y-1 translate-x-[-5px] text-xs"
            fill="currentColor"
          >
            {value}
          </text>
          <line x2="6" stroke="currentColor" />
        </g>
      ))}
      <text
        transform={`rotate(-90) translate(-${
          (range[1] - range[0]) / 2 - 35
        }, 20)`}
        textAnchor="end"
        fill="currentColor"
      >
        {label}
      </text>
    </svg>
  );
}

type YAxisProps = {
  domain: [number, number];
  range: [number, number];
  label: string;
};

export default YAxis;
