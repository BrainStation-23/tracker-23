import Image from "next/image";

import timePage from "@/public/time.png";
import reportPage from "@/public/report.png";
import heroImage from "@/public/authLeftImage.png";
import integrationPage from "@/public/integration.png";

export default function Home() {
  return (
    <>
      <nav className="bg-blue-500 p-4 text-white">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <a href="#" className="text-2xl font-bold">
              Tracker 23
            </a>
            <ul className="flex space-x-4">
              <li>
                <a href="#" className="hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <main className="bg-gray-100 text-black">
        <section className="bg-blue-900 py-10 text-white">
          <div className="container mx-auto text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
              Supercharge Your Productivity with Tracker 23
            </h1>
            <div className="flex w-full justify-center py-5 px-5 md:py-10">
              <Image
                src={heroImage}
                className="w-full lg:max-w-4xl"
                alt="authLeftImage"
              />
            </div>
            <p className="mb-6 text-lg">
              Effortlessly track time, streamline workflows, and make
              data-driven decisions.
            </p>
            <a
              href="https://app.timetracker23.com"
              className="hover:bg-gray-2008 rounded-full bg-white py-2 text-xl md:text-2xl px-6 font-semibold text-blue-900 transition"
            >
              Get Started
            </a>
          </div>
        </section>
        <section className="py-8 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-8 text-3xl font-bold md:text-4xl lg:text-5xl">
              Key Features
            </h2>
            <div className="mb-8 w-full overflow-hidden rounded-lg bg-white p-4 shadow-lg">
              <h3 className="mb-2 text-xl font-bold md:text-2xl lg:text-3xl">
                Time Tracking
              </h3>
              <Image
                src={timePage}
                alt="Feature 1 Screenshot"
                className="h-auto w-full"
              />
              <p className="mt-5">
                Effortlessly track time for your tasks and projects with Tracker
                23.
              </p>
            </div>
            <div className="mb-8 w-full overflow-hidden rounded-lg bg-white p-4 shadow-lg">
              <h3 className="mb-2 text-xl font-bold md:text-2xl lg:text-3xl">
                Reports
              </h3>
              <Image
                src={reportPage}
                alt="Feature 1 Screenshot"
                className="h-auto w-full"
              />
              <p className="mt-5">
                Generate insightful reports to make informed decisions and
                optimize workflows.
              </p>
            </div>
            <div className="w-full overflow-hidden rounded-lg bg-white p-6 shadow-lg">
              <h3 className="mb-2 text-xl font-bold md:text-2xl lg:text-3xl">
                Integration
              </h3>
              <Image
                src={integrationPage}
                alt="Feature 1 Screenshot"
                className="h-auto w-full"
              />
              <p className="mt-5">
                Seamlessly integrate with Jira and Outlook for a unified time
                tracking experience.
              </p>
            </div>
          </div>
        </section>
        <section className="py-8 md:py-16">
          <div className="container mx-auto text-center">
            <h2 className="mb-8 text-3xl font-bold md:text-4xl lg:text-5xl">
              User Benefits
            </h2>
            <div className="flex flex-wrap justify-center">
              <div className="m-4 rounded-lg bg-white p-6 shadow-lg md:w-64 lg:w-80">
                <h3 className="mb-2 text-xl font-bold md:text-2xl lg:text-3xl">
                  Save Time
                </h3>
                <p>
                  Effortlessly manage your time with automatic tracking and
                  focus on what matters most.
                </p>
              </div>
              <div className="m-4 rounded-lg bg-white p-6 shadow-lg md:w-64 lg:w-80">
                <h3 className="mb-2 text-xl font-bold md:text-2xl lg:text-3xl">
                  Boost Productivity
                </h3>
                <p>
                  Gain insights and trends to optimize workflows, enhancing
                  overall team productivity.
                </p>
              </div>
              <div className="m-4 rounded-lg bg-white p-6 shadow-lg md:w-64 lg:w-80">
                <h3 className="mb-2 text-xl font-bold md:text-2xl lg:text-3xl">
                  Enhanced Collaboration
                </h3>
                <p>
                  Seamless integration with other productivity tools for
                  enhanced collaboration and efficiency.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-8 md:py-16">
          <div className="container mx-auto text-center">
            <h2 className="mb-8 text-3xl font-bold md:text-4xl lg:text-5xl">
              Pricing Plans
            </h2>
            <div className="flex flex-wrap justify-center">
              <div className="m-4 w-full rounded-lg bg-white p-6 shadow-lg md:w-64 lg:w-80">
                <h3 className="mb-2 text-xl font-bold md:text-2xl lg:text-3xl">
                  Free
                </h3>
                <p className="text-gray-600">Perfect for individuals.</p>
                <p className="mt-4 text-2xl font-bold text-blue-500">
                  $0.00/month
                </p>
                <a
                  href="#"
                  className="mt-4 block text-blue-500 hover:underline"
                >
                  Learn More
                </a>
              </div>
              <div className="m-4 w-full rounded-lg bg-white p-6 shadow-lg md:w-64 lg:w-80">
                <h3 className="mb-2 text-xl font-bold md:text-2xl lg:text-3xl">
                  Basic
                </h3>
                <p className="text-gray-600">
                  Perfect for small teams or individuals.
                </p>
                <p className="mt-4 text-2xl font-bold text-blue-500">
                  $9.99/month
                </p>
                <a
                  href="#"
                  className="mt-4 block text-blue-500 hover:underline"
                >
                  Learn More
                </a>
              </div>
              <div className="m-4 w-full rounded-lg bg-white p-6 shadow-lg md:w-64 lg:w-80">
                <h3 className="mb-2 text-xl font-bold md:text-2xl lg:text-3xl">
                  Pro
                </h3>
                <p className="text-gray-600">
                  Ideal for growing teams with advanced features.
                </p>
                <p className="mt-4 text-2xl font-bold text-blue-500">
                  $19.99/month
                </p>
                <a
                  href="#"
                  className="mt-4 block text-blue-500 hover:underline"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-blue-500 py-16 text-white">
          <div className="container mx-auto text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
              Start Your Free Trial Today!
            </h2>
            <p className="mb-8 text-lg md:text-xl lg:text-2xl">
              Unlock the full potential of efficient time tracking and project
              management.
            </p>
            <a
              href="#"
              className="rounded-full bg-white py-2 px-6 font-semibold text-blue-900 transition hover:bg-gray-200"
            >
              Start Free Trial
            </a>
          </div>
        </section>
        <section className="py-8 md:py-16">
          <div className="container mx-auto text-center">
            <h2 className="mb-4 text-3xl font-bold md:mb-8 md:text-4xl lg:text-5xl">
              More Actions
            </h2>
            <div className="flex flex-wrap justify-center">
              <a
                href="#"
                className="m-4 rounded-full bg-blue-500 py-2 px-6 font-semibold text-white transition hover:bg-gray-700"
              >
                Learn More about Features
              </a>
              <a
                href="#"
                className="m-4 rounded-full bg-blue-500 py-2 px-6 font-semibold text-white transition hover:bg-gray-700"
              >
                Contact Us for a Demo
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-gray-900 py-8 text-white">
        <div className="container mx-auto grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-5">
          <div className="w-full px-5 text-center md:text-left">
            <h3 className="mb-4 text-xl font-bold">Tracker 23</h3>
            <p className="text-sm">
              (Building-1) 8th Floor, 2 Bir Uttam AK Khandakar Road, Mohakhali
              C/A, Dhaka 1212, Bangladesh
            </p>
          </div>

          <div className="w-full px-5 text-center md:text-left">
            <h3 className="mb-4 text-xl font-bold">Website</h3>
            <ul className="list-none">
              <li>
                <a href="#" className="hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="w-full px-5 text-center md:text-left">
            <h3 className="mb-4 text-xl font-bold">Resources</h3>
            <ul className="list-none">
              <li>
                <a href="#" className="hover:underline">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Case Studies
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          <div className="w-full px-5 text-center md:text-left">
            <h3 className="mb-4 text-xl font-bold">Connect with Us</h3>
            <ul className="list-none">
              <li>
                <a href="#" className="hover:underline">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Facebook
                </a>
              </li>
            </ul>
          </div>

          <div className="w-full px-5 text-center md:px-0 md:text-left">
            <h3 className="mb-4 text-xl font-bold">Legal</h3>
            <ul className="list-none">
              <li>
                <a href="#" className="hover:underline">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm">
            &copy; 2024 Tracker 23. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
