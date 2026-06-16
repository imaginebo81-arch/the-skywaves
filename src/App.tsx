/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import ResultPrint from "./pages/ResultPrint";
import AdminApp from "./admin/AdminApp";
import RegistrationModal from "./components/RegistrationModal";
import { ContentProvider, useContent } from "./context/ContentContext";
import { EnrollProvider } from "./context/EnrollContext";

function HomePage() {
  const content = useContent();
  return (
    <>
      <Helmet>
        <title>{content.meta.home.title}</title>
        <meta name="description" content={content.meta.home.description} />
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

function PublicSite() {
  return (
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
      <RegistrationModal />
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) {
    return <AdminApp />;
  }

  if (location.pathname.startsWith("/verification/result/")) {
    return (
      <Routes>
        <Route path="/verification/result/:rollNumber" element={<ResultPrint />} />
      </Routes>
    );
  }

  return <PublicSite />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ContentProvider>
        <EnrollProvider>
          <ScrollToTop />
          <AppRoutes />
        </EnrollProvider>
      </ContentProvider>
    </BrowserRouter>
  );
}
