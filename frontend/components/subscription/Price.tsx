'use client'

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from 'lucide-react';
import Checkout from '@/components/subscription/Checkout';

const PricingPage = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const planFeatures = [
    'Advanced analytics',
    'Unlimited projects',
    'Priority support',
    'Team collaboration',
    'Custom integrations',
    'API access',
    '24/7 phone support'
  ];

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-5xl font-bold text-center mb-6">Choose Your Plan</h1>
        <p className="text-xl text-center text-muted-foreground mb-16">Unlock the full potential of our platform</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-48">
          <Card className="p-8 flex flex-col">
            <CardHeader>
              <CardTitle className="text-3xl font-bold mb-2">Free</CardTitle>
              <CardDescription>
                <span className="text-4xl font-bold">$0</span>
                <span className="text-xl">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-4 mt-6">
                <li className="flex items-center">
                  <Check className="w-6 h-6 text-green-500 mr-3" />
                  Basic analytics
                </li>
                <li className="flex items-center">
                  <Check className="w-6 h-6 text-green-500 mr-3" />
                  1 project
                </li>
                <li className="flex items-center">
                  <Check className="w-6 h-6 text-green-500 mr-3" />
                  Community support
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full text-lg py-6" disabled>Get Started</Button>
            </CardFooter>
          </Card>

          <Card className="p-8 flex flex-col">
            <CardHeader>
              <CardTitle className="text-3xl font-bold mb-2">Pro Monthly</CardTitle>
              <CardDescription>
                <span className="text-4xl font-bold">$10</span>
                <span className="text-xl">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-4 mt-6">
                {planFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-6 h-6 text-green-500 mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Checkout priceId={process.env.NEXT_PUBLIC_PRICE_ID || ''} />
            </CardFooter>
          </Card>

          <Card className="p-8 flex flex-col">
            <CardHeader>
              <CardTitle className="text-3xl font-bold mb-2">Pro Annual</CardTitle>
              <CardDescription>
                <div>
                  <span className="text-4xl font-bold">$100</span>
                  <span className="text-xl">/year</span>
                </div>
                <div>
                  <span className="text-2xl line-through">$120</span>
                  <span className="text-3xl font-bold text-green-500 ml-2">Save 17%</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-4 mt-6">
                {planFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-6 h-6 text-green-500 mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Checkout priceId={process.env.NEXT_PUBLIC_ANNUAL_PRICE_ID || ''} />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;