
import {
  Header,
  Hero,
  ProblemStatement,
  SolutionOverview,
  KeyFeatures,
  HowItWorks,
  Benefits,
  SocialProof,
  Security,
  CTA,
  Footer
} from './components';

const Home: React.FC = () => {
  return (
    <>
      <Header />
      <Hero />
      <ProblemStatement />
      <SolutionOverview />
      <KeyFeatures />
      <HowItWorks />
      <Benefits />
      <SocialProof />
      <Security />
      <CTA />
      <Footer />
    </>
  );
};

export default Home; 