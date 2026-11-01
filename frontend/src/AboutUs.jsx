
import React from "react";
import "./AboutUs.css";

import front2 from "./assets/front2.png";
import kiddy from "./assets/kiddy.png";

function AboutUs() {
  return (
    <div className="about-page">

      {/* About StepUp */}
      <h1 className="about-main-title">About StepUp</h1>

      <div className="about-intro">

        <div className="about-text-content">

          <p>
            StepUp is India’s largest sports and athleisure footwear brand.
            Incorporated in 2006, StepUp Activewear is one of the leading
            players in organized sports & casual footwear sector in India.
            Since 2016, the flagship brand ‘StepUp’, has been the largest
            sports and athleisure footwear brand in India, in both volume
            and value terms.
          </p>

          <p>
            The company’s products are available via an expansive Pan-India
            network of over 15,000 geo-tagged multi-brand retail stores,
            35+ company-owned exclusive outlets, large format stores such
            as Walmart, Vishal Retail and Reliance Smart among others and
            all the leading e-commerce portals.
          </p>

          {/* Our Mission */}
          <h2 className="mission-title">Our Mission</h2>

          <p>
            At StepUp we craft shoes with care for everyone- men, women
            and kids, with an equal attention to detail, letting each shoe
            speak for itself. The world-class quality, trendy designs and
            affordable prices have captured the imagination of millions
            of people, across the country- making StepUp, an aspirational
            brand especially for - young adults, everyday performers
            and fashionistas.
          </p>

        </div>

        {/* One common image for all three paragraphs */}
        <div className="about-image-wrapper">
          <img
            src={front2}
            alt="StepUp footwear"
            className="about-front-image"
          />
        </div>

      </div>

      {/* Kiddy Image */}
      <div className="about-kiddy-section">
        <img
          src={kiddy}
          alt="StepUp kids footwear"
          className="about-kiddy-image"
        />
      </div>

      {/* Three Features */}
      <div className="about-features">

        <div className="about-feature">
          <h3>Simplicity In Design</h3>
          <p>
            No flashy logos, No senseless details, Just the world’s most
            comfortable shoes, made naturally and designed practically.
            It’s that simple.
          </p>
        </div>

        <div className="about-feature">
          <h3>Confidence In Comfort</h3>
          <p>
            Trying is believing. Give our shoes a shot for 30 days, and
            if you’re not walking on cloud nine, we’ll take them back -
            no questions asked.
          </p>
        </div>

        <div className="about-feature">
          <h3>Made from Nature</h3>
          <p>
            The footwear industry often overlooks mother Nature’s
            materials in favor of cheaper, synthetic alternatives.
            We think it’s time to change that.
          </p>
        </div>

      </div>

    </div>
  );
}

export default AboutUs;
