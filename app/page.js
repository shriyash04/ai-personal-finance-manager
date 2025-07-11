"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import HeroSection from "@/components/hero";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <section className="py-20 premium-bg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold gradient-title mb-2 animate-gradient">
                  {stat.value}
                </div>
                <div className="premium-text">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 premium-bg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 premium-text">
            Everything you need to manage your finances
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <Card className="p-6 premium-gradient text-slate-100 shadow-xl border-0" key={index}>
                <CardContent className="space-y-4 pt-4">
                  {feature.icon}
                  <h3 className="text-xl font-semibold text-white drop-shadow-md">{feature.title}</h3>
                  <p className="text-slate-200">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 premium-bg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 premium-text">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorksData.map((step, index) => (
              <div key={index} className="text-center hover-animate-bounce">
                <div className="w-16 h-16 premium-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white drop-shadow-md">{step.title}</h3>
                <p className="text-slate-200">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 premium-bg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 premium-text">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.map((testimonial, index) => (
              <Card key={index} className="p-6 premium-gradient text-slate-100 shadow-xl border-0">
                <CardContent className="pt-4">
                  <div className="flex items-center mb-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-white"
                    />
                    <div className="ml-4">
                      <div className="font-semibold text-white drop-shadow-md">{testimonial.name}</div>
                      <div className="text-sm text-slate-200">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-200">{testimonial.quote}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already managing their finances
            smarter with Welth
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 animate-bounce"
            >
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
