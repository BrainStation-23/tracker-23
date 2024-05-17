import Header from "./components/Header";
import Footer from "./components/Footer";
// import Pricing from "./components/Pricing";
import Features from "./components/Features";
import Suitables from "./components/Suitables";
import Solutions from "./components/Solutions";
import Integrations from "./components/Integrations";

export default function Home() {
  return (
    <>
      <Header />
      <Solutions />
      <Integrations />
      <Features />
      <Suitables />
      {/* <Pricing /> */}
      <Footer />
    </>
  );
}
