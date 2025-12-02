import React, { useContext } from "react";
import PortalHeader from "../Components/PortalHeader";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { WorkContext } from "../../ContextAPI/WorkContext";
import HeroSection from "../Components/HeroSection";
import JobCategories from "../Components/JobCategory";
import FourSteps from "../Components/EasySteps";
import WhyChoose from "../Components/WhyChoose";
import FeaturedCompanies from "../Components/FeaturedCompanies";
import FeaturedJobs from "../Components/FeaturedJobs";
import TestimonialsSection from "../Components/Testimonials";
import EmployerToolsShowcase from "../Components/EmployerTools";
import EmployerPricing from "../Components/EmployerPricing";
import EmployerBenefits from "../Components/EmployerBenefits";
import FAQSection from "../Components/FAQ";

const Portal = () => {
 




    
  return (
    <div className="space-y-12 ">
      <PortalHeader/>

      <HeroSection/>
      <JobCategories/>
      <FourSteps/>
      <WhyChoose/>
      <FeaturedCompanies/>
      <FeaturedJobs/>
      <EmployerBenefits/>
      <EmployerToolsShowcase/>
      <EmployerPricing/>
      <TestimonialsSection/>
      <FAQSection/>



    



     

      




    </div>
  );
};

export default Portal;
