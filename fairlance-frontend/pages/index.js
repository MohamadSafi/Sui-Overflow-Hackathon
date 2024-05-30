import Head from "next/head";
import Hero from "../components/Home/Hero";
import Navbar from "../components/Navbars/navbar";

import { benefitOne, benefitTwo } from "../components/Home/Data";

import Benefits from "../components/Home/Benefits";
import WhyChooseUs from "../components/Home/WhyChooseUs";
import Footer from "../components/Navbars/footer";
import JobCardsSwiper from "../components/Home/JobCardsSection";
import ComparisonTable from "../components/Home/ComparisonTable";
import ZkLoginButton from "../components/Custom/ZkLoginButton";

const Home = () => {
  return (
    <>
      <Head>
        <title>FairLance</title>
        <meta
          name="description"
          content="Fairlance is a blockchain-powered freelancing platform that ensures secure, efficient, and transparent transactions."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        <Navbar />
        <Hero />
        <WhyChooseUs />
        <JobCardsSwiper />
        <ComparisonTable />
        <Benefits data={benefitOne} />
        <Benefits imgPos="right" data={benefitTwo} />
        <Footer />
      </div>
    </>
  );
};

export default Home;
