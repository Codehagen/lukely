import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconCalendar, IconGift, IconUsers, IconTrophy, IconCheck, IconSparkles, IconChartBar } from "@tabler/icons-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 py-20 sm:py-32">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4" variant="outline">
              <IconSparkles className="mr-2 h-3 w-3" />
              Grow Your Email List with Interactive Giveaways
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Turn Holidays Into Lead Magnets
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Create interactive advent calendars, countdown campaigns, and daily giveaways that capture leads and drive engagement. Perfect for e-commerce brands, agencies, and marketers.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="text-lg px-8">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/dashboard/calendars">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  View Demo
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required • 14-day free trial
            </p>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.100),white)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.950),theme(colors.gray.950))] opacity-20" />
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to run viral giveaway campaigns
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed for growth marketers and e-commerce brands
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <IconCalendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Pre-Built Templates</CardTitle>
                <CardDescription>
                  Launch in minutes with ready-made templates for Christmas, Valentine's, Easter, and custom campaigns
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                  <IconGift className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Daily Giveaways</CardTitle>
                <CardDescription>
                  Add products to each door and automatically manage entries, winners, and prize fulfillment
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 w-12 h-12 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <IconUsers className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Lead Capture Forms</CardTitle>
                <CardDescription>
                  Collect emails, names, phone numbers with customizable entry forms. Export to your CRM anytime
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-950 flex items-center justify-center">
                  <IconTrophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle>Random Winner Selection</CardTitle>
                <CardDescription>
                  Fair and transparent winner picking with one click. Automatic notifications keep winners engaged
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-950 flex items-center justify-center">
                  <IconSparkles className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <CardTitle>Brand Customization</CardTitle>
                <CardDescription>
                  Full white-label options with custom colors, logos, and domain. Match your brand perfectly
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                  <IconChartBar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Track engagement, conversion rates, and campaign performance with detailed analytics dashboards
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Launch your campaign in 3 simple steps
            </h2>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Template</h3>
              <p className="text-muted-foreground">
                Select from Christmas advent, Valentine's countdown, or create your own custom calendar
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Add Products</h3>
              <p className="text-muted-foreground">
                Upload your giveaway prizes for each door with images, descriptions, and values
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Go Live</h3>
              <p className="text-muted-foreground">
                Share your calendar link and watch the leads roll in. Export data to your favorite tools
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Trusted by growing brands
              </h2>
              <p className="text-lg text-muted-foreground">
                Join hundreds of businesses using interactive calendars to grow their audience
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <IconCheck key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "We captured over 5,000 leads with our Christmas advent calendar. The platform paid for itself 10x over."
                  </p>
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Marketing Director, BeautyBrand</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <IconCheck key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "Setup took less than 30 minutes. Our engagement rate was 10x higher than traditional email campaigns."
                  </p>
                  <p className="font-semibold">Mike Chen</p>
                  <p className="text-sm text-muted-foreground">CEO, GiftShop Co.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Ready to grow your email list?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Start your 14-day free trial today. No credit card required.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/dashboard/calendars">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white/10">
                  View Live Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 dark:bg-gray-900 border-t">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <IconCalendar className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-lg">Calendar Lead Magnets</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="#" className="hover:text-foreground">Terms of Service</Link>
              <Link href="#" className="hover:text-foreground">Contact</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Calendar Lead Magnets. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
