/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import TrustIndicators from "./components/TrustIndicators";
import FeaturedCourses from "./components/FeaturedCourses";
import EnglishCourses from "./components/EnglishCourses";
import FashionCourses from "./components/FashionCourses";
import BoutiqueCourses from "./components/BoutiqueCourses";
import Testimonials from "./components/Testimonials";
import EnquiryForm from "./components/EnquiryForm";
import Footer from "./components/Footer";
import StudentVerification from "./components/StudentVerification";
import EmploymentVerification from "./components/EmploymentVerification";
import ContactUs from "./components/ContactUs";
import CoursesPage from "./pages/CoursesPage";
import AboutUs from "./components/AboutUs";

function HomePage() {
  return (
    <>
      <Hero />
      <TrustIndicators />
      <FeaturedCourses />
      <EnglishCourses />
      <FashionCourses />
      <BoutiqueCourses />
      
      <div className="w-full bg-[#151b23]">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-12 py-16">
          <Testimonials />
        </div>
      </div>
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-12 pb-24">
        <EnquiryForm />
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="antialiased min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/about" element={<div className="py-20 px-4 md:px-12"><AboutUs /></div>} />
            <Route path="/verification" element={<div className="py-20 px-4 md:px-12"><StudentVerification /></div>} />
            <Route path="/employment-verification" element={<div className="py-20 px-4 md:px-12"><EmploymentVerification /></div>} />
            <Route path="/contact" element={<div className="py-20 px-4 md:px-12"><ContactUs /></div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

