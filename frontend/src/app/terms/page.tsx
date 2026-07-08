"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";

export default function TermsOfServicePage() {
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
    { id: "acceptance", label: "Acceptance of Terms" },
    { id: "usage", label: "Use of Services" },
    { id: "responsibilities", label: "User Responsibilities" },
    { id: "registration", label: "Account Registration" },
    { id: "ip", label: "Intellectual Property" },
    { id: "prohibited", label: "Prohibited Activities" },
    { id: "availability", label: "Service Availability" },
    { id: "liability", label: "Limitation of Liability" },
    { id: "termination", label: "Termination" },
    { id: "law", label: "Governing Law" },
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
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12 border-b border-slate-200 pb-8">
          <nav className="flex mb-4 text-sm text-slate-500 gap-2 items-center">
            <Link className="hover:text-[#1736cf]" href="/">
              Home
            </Link>
            <span className="text-xs">&gt;</span>
            <span className="text-slate-900 font-medium">Terms of Service</span>
          </nav>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-slate-500">Last updated: March 13, 2026</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="mb-12 lg:mb-0 lg:w-64 shrink-0">
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
                value={activeSection || "acceptance"}
              >
                {navLinks.map((link) => (
                  <option key={link.id} value={link.id}>
                    {link.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block sticky top-24 overflow-y-auto pr-4 pb-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                On this page
              </h2>
              <ul className="space-y-1">
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeSection === link.id
                          ? "bg-[#1736cf]/10 text-[#1736cf]"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                      href={`#${link.id}`}
                      onClick={(e) => scrollToSection(e, link.id)}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 max-w-3xl space-y-12">
            {/* Section 1 */}
            <section
              className="scroll-mt-24 bg-white rounded-xl border border-slate-200 p-8 shadow-sm"
              id="acceptance"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1736cf]/10 text-[#1736cf] font-bold text-xl">
                  1
                </div>
                <h2 className="text-2xl font-bold">Acceptance of Terms</h2>
              </div>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                <p>
                  By accessing or using Eromify, you agree to be bound by these
                  Terms of Service and all applicable laws and regulations. If you
                  do not agree with any of these terms, you are prohibited from
                  using or accessing this site.
                </p>
                <p className="mt-4">
                  We reserve the right to review and amend any of these Terms of
                  Service at our sole discretion. Upon doing so, we will update
                  this page. Any changes to these Terms of Service will take effect
                  immediately from the date of publication.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section
              className="scroll-mt-24 bg-white rounded-xl border border-slate-200 p-8 shadow-sm"
              id="usage"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1736cf]/10 text-[#1736cf] font-bold text-xl">
                  2
                </div>
                <h2 className="text-2xl font-bold">Use of Services</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Our services are designed to provide a comprehensive management
                platform for your digital assets. You are granted a non-exclusive,
                non-transferable, revocable license to access and use Eromify
                strictly in accordance with these terms.
              </p>
              <div className="mt-6 rounded-lg bg-slate-50 p-4 border-l-4 border-[#1736cf]">
                <p className="text-sm italic text-slate-500">
                  Note: Commercial use requires a specific subscription tier as
                  outlined in our Pricing guide.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section
              className="scroll-mt-24 bg-white rounded-xl border border-slate-200 p-8 shadow-sm"
              id="responsibilities"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1736cf]/10 text-[#1736cf] font-bold text-xl">
                  3
                </div>
                <h2 className="text-2xl font-bold">User Responsibilities</h2>
              </div>
              <ul className="space-y-4 text-slate-600">
                <li className="flex gap-3">
                  <CheckCircle2 className="text-[#1736cf] h-5 w-5 shrink-0" />
                  <span>
                    You are responsible for maintaining the confidentiality of your
                    account credentials.
                  </span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="text-[#1736cf] h-5 w-5 shrink-0" />
                  <span>
                    You must notify us immediately of any unauthorized use of your
                    account.
                  </span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="text-[#1736cf] h-5 w-5 shrink-0" />
                  <span>
                    You agree not to bypass any measures we may use to prevent or
                    restrict access to the service.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section
              className="scroll-mt-24 bg-white rounded-xl border border-slate-200 p-8 shadow-sm"
              id="registration"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1736cf]/10 text-[#1736cf] font-bold text-xl">
                  4
                </div>
                <h2 className="text-2xl font-bold">Account Registration</h2>
              </div>
              <p className="text-slate-600 leading-relaxed mb-6">
                To access certain features of the service, you may be required to
                register for an account. You agree to provide accurate, current, and
                complete information during the registration process.
              </p>
              <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1736cf]/5 to-transparent"></div>
                {/* Visual placeholder matching the original HTML icon concept */}
                <div className="text-6xl text-slate-300 font-bold">🛡️</div>
              </div>
            </section>

            {/* Section 5 */}
            <section
              className="scroll-mt-24 bg-white rounded-xl border border-slate-200 p-8 shadow-sm"
              id="ip"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1736cf]/10 text-[#1736cf] font-bold text-xl">
                  5
                </div>
                <h2 className="text-2xl font-bold">Intellectual Property</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                The service and its original content, features, and functionality
                are and will remain the exclusive property of Eromify and its
                licensors. Our trademarks and trade dress may not be used in
                connection with any product or service without the prior written
                consent of Eromify.
              </p>
            </section>

            {/* Section 6 */}
            <section
              className="scroll-mt-24 bg-white rounded-xl border border-slate-200 p-8 shadow-sm"
              id="prohibited"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1736cf]/10 text-[#1736cf] font-bold text-xl">
                  6
                </div>
                <h2 className="text-2xl font-bold">Prohibited Activities</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-slate-100">
                  <h3 className="font-bold mb-2">Illegal Use</h3>
                  <p className="text-sm text-slate-500">
                    You may not use the service for any illegal or unauthorized
                    purpose.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-slate-100">
                  <h3 className="font-bold mb-2">Bot Usage</h3>
                  <p className="text-sm text-slate-500">
                    The use of automated systems or software to extract data is
                    prohibited.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-slate-100">
                  <h3 className="font-bold mb-2">Reverse Engineering</h3>
                  <p className="text-sm text-slate-500">
                    You may not attempt to decompile or reverse engineer any
                    software.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-slate-100">
                  <h3 className="font-bold mb-2">Spamming</h3>
                  <p className="text-sm text-slate-500">
                    Transmission of any &apos;spam&apos;, &apos;junk mail&apos;, or similar
                    solicitation is forbidden.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section
              className="scroll-mt-24 bg-white rounded-xl border border-slate-200 p-8 shadow-sm"
              id="availability"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1736cf]/10 text-[#1736cf] font-bold text-xl">
                  7
                </div>
                <h2 className="text-2xl font-bold">Service Availability</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                While we strive for 99.9% uptime, we do not guarantee that our
                service will be available at all times. We may occasionally need to
                perform maintenance or upgrades that could lead to temporary
                interruptions.
              </p>
            </section>

            {/* Section 8 */}
            <section
              className="scroll-mt-24 bg-white rounded-xl border border-slate-200 p-8 shadow-sm"
              id="liability"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1736cf]/10 text-[#1736cf] font-bold text-xl">
                  8
                </div>
                <h2 className="text-2xl font-bold">Limitation of Liability</h2>
              </div>
              <p className="text-slate-600 leading-relaxed italic border-l-2 border-slate-300 pl-4">
                &quot;In no event shall Eromify, nor its directors, employees, partners,
                agents, suppliers, or affiliates, be liable for any indirect,
                incidental, special, consequential or punitive damages, including
                without limitation, loss of profits, data, use, goodwill, or other
                intangible losses.&quot;
              </p>
            </section>

            {/* Section 9 */}
            <section
              className="scroll-mt-24 bg-white rounded-xl border border-slate-200 p-8 shadow-sm"
              id="termination"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1736cf]/10 text-[#1736cf] font-bold text-xl">
                  9
                </div>
                <h2 className="text-2xl font-bold">Termination</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                We may terminate or suspend your account and bar access to the
                service immediately, without prior notice or liability, under our
                sole discretion, for any reason whatsoever and without limitation,
                including but not limited to a breach of the Terms.
              </p>
            </section>

            {/* Section 10 */}
            <section
              className="scroll-mt-24 bg-white rounded-xl border border-slate-200 p-8 shadow-sm"
              id="law"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1736cf]/10 text-[#1736cf] font-bold text-xl">
                  10
                </div>
                <h2 className="text-2xl font-bold">Governing Law</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                These Terms shall be governed and construed in accordance with the
                laws of Delaware, United States, without regard to its conflict of
                law provisions. Our failure to enforce any right or provision of
                these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            {/* Section 11 */}
            <section
              className="scroll-mt-24 bg-white rounded-xl border border-slate-200 p-8 shadow-sm"
              id="contact"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1736cf]/10 text-[#1736cf] font-bold text-xl">
                  11
                </div>
                <h2 className="text-2xl font-bold">Contact Information</h2>
              </div>
              <p className="text-slate-600 leading-relaxed mb-6">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 font-medium">
                  <Mail className="text-[#1736cf] h-5 w-5" />
                  <a
                    className="text-[#1736cf] hover:underline"
                    href="mailto:eromify.in@gmail.com"
                  >
                    eromify.in@gmail.com
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Floating Top Scroll Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 h-12 w-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-[#1736cf] hover:scale-110 transition-transform"
        aria-label="Scroll to top"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    </div>
  );
}
