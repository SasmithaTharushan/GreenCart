import MainBanner from '../components/MainBanner';
import Categories from '../components/Categories';
import BestSeller from '../components/BestSeller';
import BottomBanner from '../components/BottomBanner';
import NewsLetter from '../components/NewsLetter';
import Seo from '../components/Seo';

const Home = () => (
  <div className="mt-10">
    <Seo />
    <MainBanner />
    <Categories />
    <BestSeller />
    <BottomBanner />
    <NewsLetter />
  </div>
);

export default Home;
