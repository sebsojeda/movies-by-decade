import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import cloud, { Word } from "d3-cloud";
import { schemeYlOrBr } from "d3-scale-chromatic";

function Chart({ data, dimensions }: ChartProps) {
  const ref = useRef(null);
  const { width, height, margin } = dimensions;

  useEffect(() => {
    const svg = d3.select(ref.current);
    const minYear = new Date(data.meta.minYear);
    const maxYear = new Date(data.meta.maxYear);

    const colorScale = d3.scaleOrdinal(schemeYlOrBr[9]).range();

    const xScale = d3
      .scaleTime()
      .domain([
        new Date(
          minYear.getFullYear() - 10,
          minYear.getMonth(),
          minYear.getDay()
        ),
        new Date(
          maxYear.getFullYear() + 10,
          maxYear.getMonth(),
          maxYear.getDay()
        ),
      ])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 10])
      .range([height - margin.top - margin.bottom, 0]);

    svg
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", ".75em")
      .attr("fill", "currentColor")
      .attr("font-size", 20)
      .attr("transform", `translate(0, ${height / 2 - 100}) rotate(-90)`)
      .text("IMDB Rating");

    svg
      .append("g")
      .call(
        d3
          .axisBottom(xScale)
          .ticks(10)
          .tickSize(height - margin.top - margin.bottom - 200)
          .tickFormat(() => "")
      )
      .style("stroke-dasharray", "10 10")
      .attr("transform", "translate(0, 100)")
      .style("color", "gray");

    d3.select(".domain").remove();

    const line = d3
      .line<any>()
      .x((d) => xScale(new Date(d.startYear)))
      .y((d) => yScale(d.averageRating));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));

    svg
      .append("path")
      .datum(data.data)
      .attr("fill", "none")
      .attr("stroke", "currentColor")
      .attr("d", line);

    // svg
    //   .selectAll("vertical-grid")
    //   .data(yScale.ticks())
    //   .enter()
    //   .append("line")
    //   .attr("y1", (d) => yScale(d))
    //   .attr("y2", height);

    data.data.forEach((d) => {
      const word_freq: Word[] = [];

      Object.entries(d.genres).forEach((e) => {
        word_freq.push({
          text: e[0],
          size: e[1],
        });
      });

      cloud()
        .size([150, 500])
        .words(word_freq)
        .rotate(0)
        .fontSize((d) => {
          const size = Math.sqrt(d.size as number);
          if (Number.isNaN(size)) {
            return 10;
          }
          return size;
        })
        .on("end", (words) => {
          let maxSize = Number.MIN_VALUE;
          let minSize = Number.MAX_VALUE;

          words.map((word) => {
            if (word.size && word.size > maxSize) maxSize = word.size;
            if (word.size && word.size < minSize) minSize = word.size;
          });

          const g = svg
            .append("g")
            .attr("height", 500)
            .attr("width", 150)
            .attr("font-family", "sans-serif")
            .attr("text-anchor", "middle")
            .attr(
              "transform",
              `translate(${xScale(new Date(d.startYear))},${
                yScale(d.averageRating) + 300
              })`
            );

          words.map(({ size, x, y, rotate, text }) => {
            let rel_size = ((size as number) - minSize) / (maxSize - minSize);
            if (Number.isNaN(rel_size)) rel_size = 0.2;

            g.append("text")
              .attr("fill", "currentColor")
              .attr("font-size", rel_size * 45)
              .attr("opacity", rel_size < 0.04 ? 0.04 : rel_size)
              .attr(
                "transform",
                `translate(${x},${Math.random() * 300}) rotate(${rotate})`
              )
              .text(text as string);
          });
        })
        .start();
    });

    d3.select("#tooltip").attr("style", "position: absolute; opacity: 0;");

    svg
      .selectAll("line-circle")
      .data(data.data)
      .enter()
      .append("circle")
      .attr("fill", (d) => {
        const rel_rev =
          (d.revenue - data.meta.minRevenue) /
          (data.meta.maxRevenue - data.meta.minRevenue);
        return colorScale[Math.floor(rel_rev * 8)];
      })
      .attr("r", (d) => {
        return (
          ((d.budget - data.meta.minBudget) /
            (data.meta.maxBudget - data.meta.minBudget)) *
          90
        );
      })
      .attr("cx", (d) => xScale(new Date(d.startYear)))
      .attr("cy", (d) => yScale(d.averageRating))
      .on("mouseover", (e, d) => {
        const tooltip = d3.select("#tooltip");

        tooltip
          .append("div")
          .text(`Budget: \$${Math.round(d.budget).toLocaleString()}`);

        tooltip
          .append("div")
          .text(`Revenue: \$${Math.round(d.revenue).toLocaleString()}`);

        tooltip.append("div").text(`Rating: ${d.averageRating.toFixed(1)}`);

        tooltip.transition().duration(200).style("opacity", 1);
      })
      .on("mouseout", function () {
        const tooltip = d3.select("#tooltip");

        tooltip.style("opacity", 0);
        tooltip.selectChildren().remove();
      })
      .on("mousemove", (e) => {
        const tooltip = d3.select("#tooltip");

        tooltip
          .style("left", e.pageX - 10 + "px")
          .style("top", e.pageY + 30 + "px");
      });

    svg
      .selectAll("line-circle")
      .data(data.data)
      .enter()
      .append("text")
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .attr("transform", "translate(0, -100)")
      .text((d) => {
        const year = new Date(d.startYear).getFullYear();
        return `${year + 1} - ${year + 11}`;
      })
      .attr("x", (d) => xScale(new Date(d.startYear)))
      .attr("y", (d) => yScale(d.averageRating));

    return () => {
      svg.selectChildren().remove();
    };
  }, [data, width, height, margin]);

  return (
    <>
      <div id="tooltip" className="bg-white text-black p-2" />
      <svg width={width} height={height}>
        <g ref={ref} transform={`translate(${margin.left}, ${margin.top})`} />
      </svg>
    </>
  );
}

export type ChartData = {
  meta: {
    minBudget: number;
    maxBudget: number;
    minRevenue: number;
    maxRevenue: number;
    minYear: number;
    maxYear: number;
  };
  data: {
    startYear: number;
    averageRating: number;
    budget: number;
    revenue: number;
    genres: {
      [key: string]: number;
    };
  }[];
};

export type ChartDimensions = {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
};

type ChartProps = {
  data: ChartData;
  dimensions: ChartDimensions;
};

export default Chart;
