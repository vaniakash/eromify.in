"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let current = "";
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        if (window.scrollY >= sectionTop - 120) {
          current = section.getAttribute("id") || "";
        }
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "introduction", label: "Introduction" },
    { id: "info-collect", label: "Information We Collect" },
    { id: "how-we-use", label: "How We Use Information" },
    { id: "cookies", label: "Cookies & Tracking" },
    { id: "third-party", label: "Third-Party Services" },
    { id: "data-security", label: "Data Security" },
    { id: "user-rights", label: "User Rights" },
    { id: "policy-changes", label: "Changes to Policy" },
    { id: "contact", label: "Contact Information" },
  ];

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-white pt-16 pb-12 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-slate-500">
              Last updated: <time dateTime="2026-03-13">March 13, 2026</time>
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:gap-16">
          {/* Sidebar */}
          <aside className="mb-12 lg:mb-0 lg:w-64 flex-shrink-0">
            {/* Mobile Dropdown */}
            <div className="lg:hidden mb-8">
              <label
                className="block text-sm font-medium text-slate-700 mb-2"
                htmlFor="toc-select"
              >
                Jump to section
              </label>
              <select
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-[#1736cf] focus:ring-[#1736cf] text-sm"
                id="toc-select"
                onChange={handleSelectChange}
                value={activeSection || "introduction"}
              >
                {navLinks.map((link) => (
                  <option key={link.id} value={link.id}>
                    {link.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Sidebar */}
            <nav className="hidden lg:block sticky top-24 space-y-1">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                On this page
              </h3>
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => scrollToSection(e, link.id)}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    activeSection === link.id
                      ? "bg-[#1736cf]/10 text-[#1736cf]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#1736cf]"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Policy Text */}
          <article className="prose prose-blue max-w-[800px] flex-grow bg-white p-8 sm:p-12 shadow-sm ring-1 ring-slate-200 rounded-xl">
            <section id="introduction" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                1. Introduction
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Welcome to Eromify. We value your privacy and are committed to
                protecting your personal data. This Privacy Policy describes how
                Eromify (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares
                information about you when you use our website, mobile applications,
                and other online products and services.
              </p>
              <p className="text-slate-600 mb-4 leading-relaxed">
                By accessing or using our services, you agree to the terms of this
                Privacy Policy and our Terms of Service. If you do not agree with
                our practices, please do not use our services.
              </p>
            </section>

            <section id="info-collect" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                2. Information We Collect
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                We collect information that you provide directly to us, such as when
                you create an account, subscribe to our newsletter, or contact
                support.
              </p>
              <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">
                Personal Data
              </h3>
              <ul className="list-disc pl-5 mb-6 text-slate-600 space-y-2">
                <li>Name and contact information (email address, phone number).</li>
                <li>Account credentials (username, encrypted password).</li>
                <li>
                  Billing information (processed via secure third-party payment
                  processors).
                </li>
              </ul>
              <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">
                Usage Data
              </h3>
              <p className="text-slate-600 mb-4 leading-relaxed">
                We also automatically collect information about how you interact
                with our services, including IP addresses, browser type, device
                information, and pages visited.
              </p>
            </section>

            <section id="how-we-use" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                3. How We Use Your Information
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                We use the information we collect to provide, maintain, and improve
                our services, including:
              </p>
              <ul className="list-disc pl-5 mb-6 text-slate-600 space-y-2">
                <li>Processing transactions and sending related information.</li>
                <li>Sending technical notices, updates, and security alerts.</li>
                <li>Responding to your comments and questions.</li>
                <li>
                  Personalizing your experience and delivering content relevant to
                  your interests.
                </li>
                <li>
                  Monitoring and analyzing trends and usage in connection with our
                  services.
                </li>
              </ul>
            </section>

            <section id="cookies" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                4. Cookies and Tracking Technologies
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Eromify uses cookies and similar technologies to track activity on
                our service and hold certain information. Cookies are files with
                small amount of data which may include an anonymous unique
                identifier.
              </p>
              <p className="text-slate-600 mb-4 leading-relaxed">
                You can instruct your browser to refuse all cookies or to indicate
                when a cookie is being sent. However, if you do not accept cookies,
                you may not be able to use some portions of our service.
              </p>
            </section>

            <section id="third-party" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                5. Third-Party Services
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                We may employ third-party companies and individuals to facilitate
                our service (e.g., payment processors like Stripe, analytics
                providers like Google Analytics). These third parties have access to
                your Personal Data only to perform these tasks on our behalf and are
                obligated not to disclose or use it for any other purpose.
              </p>
            </section>

            <section id="data-security" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                6. Data Security
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                The security of your data is important to us. We implement
                industry-standard security measures to protect your personal
                information from unauthorized access, disclosure, alteration, and
                destruction. However, remember that no method of transmission over
                the Internet is 100% secure.
              </p>
            </section>

            <section id="user-rights" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                7. User Rights
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Depending on your location, you may have the following rights
                regarding your personal data:
              </p>
              <ul className="list-disc pl-5 mb-6 text-slate-600 space-y-2">
                <li>
                  The right to access, update, or delete the information we have on
                  you.
                </li>
                <li>
                  The right of rectification (to have your information corrected).
                </li>
                <li>
                  The right to object to our processing of your personal data.
                </li>
                <li>The right to data portability.</li>
              </ul>
            </section>

            <section id="policy-changes" className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                8. Changes to this Policy
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify
                you of any changes by posting the new Privacy Policy on this page
                and updating the &quot;Last updated&quot; date at the top of this policy. You
                are advised to review this Privacy Policy periodically for any
                changes.
              </p>
            </section>

            <section id="contact" className="mb-0">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                9. Contact Information
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact
                us:
              </p>
              <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                <ul className="list-none space-y-4">
                  <li className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#1736cf]" />
                    <a
                      className="text-[#1736cf] font-medium hover:underline"
                      href="mailto:eromify.in@gmail.com"
                    >
                      eromify.in@gmail.com
                    </a>
                  </li>
                </ul>
              </div>
            </section>
          </article>
        </div>
      </main>
    </div>
  );
}
