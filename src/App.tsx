/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import {
  ComputerScience,
  LanguageMastery,
  CreativeWellness,
} from "./components/CourseSections";
import Testimonials from "./components/Testimonials";
import EnquiryForm from "./components/EnquiryForm";
import Footer from "./components/Footer";
import StudentVerification from "./components/StudentVerification";
import ContactUs from "./components/ContactUs";

function HomePage() {
  return (
    <>
      <Hero />
      <ComputerScience />
      <LanguageMastery />
      <CreativeWellness />
      <Testimonials />
      <EnquiryForm />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="antialiased min-h-screen flex flex-col font-body-md text-body-md">
        <Header />
        <main className="flex-grow w-full mx-auto px-4 md:px-[80px] py-section-margin flex flex-col gap-section-margin mt-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/verification" element={<StudentVerification />} />
            <Route path="/contact" element={<ContactUs />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

