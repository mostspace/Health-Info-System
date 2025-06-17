import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeartbeat, FaChartLine, FaUsers } from 'react-icons/fa';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Transform your health with</span>{' '}
                <span className="block text-teal-600 xl:inline">personalized care</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Take control of your wellness journey with our comprehensive health management system. 
                Track progress, connect with professionals, and achieve your health goals.
              </p>
              
              <div className="mt-8 space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 md:text-lg"
                >
                  Get Started
                </Link>
                <Link
                  to="/programs"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200 md:text-lg"
                >
                  View Programs
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-teal-500 text-white mx-auto">
                    <FaHeartbeat className="h-6 w-6" />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Personalized Health Plans</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-teal-500 text-white mx-auto">
                    <FaChartLine className="h-6 w-6" />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Progress Tracking</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-teal-500 text-white mx-auto">
                    <FaUsers className="h-6 w-6" />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Expert Support</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
          alt="Health and wellness"
        />
      </div>
    </div>
  );
};

export default Hero;
