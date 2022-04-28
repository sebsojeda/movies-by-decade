import * as d3 from "d3";
import { useMemo } from "react";

function XAxis({ domain, range }: XAxisProps) {
  const ticks = useMemo(() => {
    const xScale = d3.scaleLinear().domain(domain).range(range);
    const height = range[1] - range[0];
    const pixelsPerTick = 30;
    const numberOfTicksTarget = Math.max(1, Math.floor(height / pixelsPerTick));

    return xScale
      .ticks(numberOfTicksTarget)
      .map((value) => ({ value, yOffset: xScale(value) }));
  }, [domain, range]);

  return (
    <svg height={range[1] + 10} width={57}>
      <path
        d={`M ${range[0]} 6 v -6 H ${range[1]} h -6`}
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
    </svg>
  );
}

type XAxisProps = {
  domain: [number, number];
  range: [number, number];
};

export default XAxis;
