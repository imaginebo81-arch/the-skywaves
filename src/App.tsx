/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
import NotFound from "./components/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";

function HomePage() {
  return (
    <>
      <Helmet>
        <title>Skywaves Educare - Empowering Your Future</title>
        <meta name="description" content="Join Skywaves Educare for premium courses in Computer Science, English, Fashion Design, and Boutique Studies. Start your journey today!" />
      </Helmet>
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
      <ScrollToTop />
      <div className="antialiased min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/about-us" element={<div className="py-20 px-4 md:px-12"><AboutUs /></div>} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/verification" element={<div className="py-20 px-4 md:px-12"><StudentVerification /></div>} />
            <Route path="/employment-verification" element={<div className="py-20 px-4 md:px-12"><EmploymentVerification /></div>} />
            <Route path="/contact" element={<div className="py-20 px-4 md:px-12"><ContactUs /></div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

