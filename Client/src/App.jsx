import React, {  useEffect } from 'react';
import Footer from './Global/Components/Footer';
import Portal from './Global/Pages/Portal';
import { Route,Routes } from 'react-router-dom';
import Enroll from './Global/Pages/Enroll';
import RoleRouter from './Global/Components/RoleRouter';

const App = () => {
  
  useEffect(() => {
    const fadeEls = document.querySelectorAll('div');
    fadeEls.forEach(div => div.classList.add('fade-in'));
    console.log("Divs updated:", fadeEls.length);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      document.querySelectorAll(".fade-in").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          el.classList.add("show");
        } else {
          el.classList.remove("show");
        }
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

    



   

  


  return ( 
     <>
      <Routes>
        <Route path="/" element={<Portal />} />
        <Route path="/enroll" element={<Enroll />} />
        <Route path="/auth/:role/:username/*" element={
      <RoleRouter />
} />


      </Routes>

      <Footer />
     
     </>
  );
};

export default App;
