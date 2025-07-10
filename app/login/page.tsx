"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Bug,
  Shield,
  CheckCircle,
  Users,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { LoadingButton, Loader } from "@/components/ui/loader";

export default function LoginPage() {
  const { login, loading, error, isAuthenticated , clearError } = useAuth();
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const successMessage = searchParams.get('message');
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
    clearError();
  }, [isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setFormError("Please fill in all fields");
      return;
    }

    try {
      setIsButtonLoading(true);
      await login(formData.email, formData.password); // your context login
      router.push("/dashboard");
    } catch (error) {
      // handled by context
    } finally {
      setIsButtonLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <Bug className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-bold">QAMonitorTool</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Professional Quality Assurance Management
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Streamline your testing workflow with our comprehensive QA
              monitoring platform designed for modern development teams.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure & Reliable</h3>
                <p className="text-blue-100">
                  Enterprise-grade security with role-based access control
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Advanced Analytics</h3>
                <p className="text-blue-100">
                  Real-time insights and comprehensive reporting
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Team Collaboration</h3>
                <p className="text-blue-100">
                  Seamless collaboration across development teams
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="font-medium">Trusted by 500+ Teams</span>
            </div>
            <p className="text-sm text-blue-100">
              "QAMonitorTool has transformed our testing process, reducing bugs
              by 60% and improving deployment confidence."
            </p>
            <p className="text-sm text-blue-200 mt-2 font-medium">
              - Sarah Chen, QA Lead at TechCorp
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8 pt-8">
              <div className="flex items-center justify-center space-x-2 mb-6 lg:hidden">
                <Bug className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">
                  QAMonitorTool
                </span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Welcome Back
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Sign in to your account to continue
              </p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {successMessage && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {(error || formError) && (
                  <Alert
                    variant="destructive"
                    className="border-red-200 bg-red-50"
                  >
                    <AlertDescription className="text-red-800">
                      {error || formError}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="h-12 pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isButtonLoading}
                  className="w-full h-12 flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {isButtonLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                  >
                    Create Account
                  </Link>
                </p>
              </div>

              <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 mb-4 font-semibold text-center">
                  Teams that trust QAMonitorTool:
                </p>
                <div className="flex items-center justify-center space-x-5">
                  <img
                    src="/image1.png"
                    alt="Team 1"
                    className="h-14 w-14 rounded-full shadow-md"
                  />
                  <img
                    src="/image2.png"
                    alt="Team 2"
                    className="h-14 w-14 rounded-full shadow-md"
                  />
                  <img
                    src="/image3.png"
                    alt="Team 3"
                    className="h-14 w-14 rounded-full shadow-md"
                  />
                  <img
                    src="/image4.png"
                    alt="Team 4"
                    className="h-14 w-14 rounded-full shadow-md"
                  />
                  <span className="text-sm text-gray-600 font-medium ml-2">
                    + hundreds more
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
