import Chart, { ChartData } from "../components/chart";
import data from "../public/static/average-rating-by-decade.json";
import meta from "../public/static/metadata.json";

function Home({ data }: HomeProps) {
  return (
    <div className="bg-neutral-900 text-white p-10 w-fit">
      <div className="ml-40 max-w-2xl">
        <h1 className="text-5xl font-serif">Movies By Decade</h1>
        <div className="mt-4 text-2xl">
          The graph shows average IMDB scores from each decade from 1910 - 2020
          along with the average movie budget and revenue. The word clouds show
          popular movie genres in each decade.
        </div>
      </div>
      <Chart
        data={data}
        dimensions={{
          width: 2400,
          height: 1200,
          margin: { top: 50, right: 50, bottom: 50, left: 50 },
        }}
      />
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      data: {
        meta,
        data,
      },
    },
  };
}

type HomeProps = {
  data: ChartData;
};

export default Home;
