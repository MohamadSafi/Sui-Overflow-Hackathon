import {
  ShieldCheckIcon,
  CurrencyDollarIcon,
  BoltIcon,
  KeyIcon,
  LinkIcon,
  GiftIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/solid";

import benefitOneImg from "../../public/img/home/benefit-one.svg";
import benefitTwoImg from "../../public/img/home/benefit-two.svg";

const benefitOne = {
  title: "Harness the Power of Blockchain with Fairlance",
  desc: "Fairlance leverages blockchain technology to provide a secure, efficient, and transparent freelancing platform. Experience the future of freelancing with the following features:",
  image: benefitOneImg,
  bullets: [
    {
      title: "Seamless Social Media Login",
      desc: "Login effortlessly with any of your social media accounts using zero-knowledge proof technology.",
      icon: <ShieldCheckIcon />,
    },
    {
      title: "Cryptocurrency Payments",
      desc: "Pay and get paid with crypto, enabling fast and secure transactions across the globe.",
      icon: <CurrencyDollarIcon />,
    },
    {
      title: "No Gas Fees",
      desc: "Forget about gas fees thanks to sponsored transactions functionality powered by Sui Move.",
      icon: <BoltIcon />,
    },
  ],
};

const benefitTwo = {
  title: "More Unmatched Benefits",
  desc: "Fairlance offers additional features that set us apart from traditional freelancing platforms. Discover the advantages that make Fairlance your go-to choice for freelancing:",
  image: benefitTwoImg,
  bullets: [
    {
      title: "Enhanced Security",
      desc: "Benefit from the robust security features inherent in blockchain technology, ensuring your data and transactions are always protected.",
      icon: <KeyIcon />,
    },
    {
      title: "Decentralized Network",
      desc: "Enjoy the freedom and reliability of a decentralized network, reducing the risk of central points of failure.",
      icon: <LinkIcon />,
    },
    {
      title: "Global Accessibility",
      desc: "Our platform is designed to be accessible from anywhere in the world, making it easier than ever to connect with clients and freelancers.",
      icon: <GlobeAltIcon />,
    },
    {
      title: "Achievement Rewards",
      desc: "Receive assets directly to your wallet as airdrops when you complete a certain number of jobs and achievements.",
      icon: <GiftIcon />,
    },
  ],
};

export { benefitOne, benefitTwo };
