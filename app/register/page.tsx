"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Bug, Rocket, Zap, Target } from "lucide-react";
import Link from "next/link";
import { LoadingButton, Loader } from "@/components/ui/loader";

// Field-specific error interface
interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function RegisterPage() {
  const { register, loading, error, isAuthenticated, clearError } = useAuth();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "tester",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
    clearError();
  }, [isAuthenticated, router]);

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength validation
  const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Validate individual field
  const validateField = (fieldName: string, value: string): string | null => {
    switch (fieldName) {
      case "name":
        if (!value.trim()) {
          return "Full name is required";
        }
        if (value.trim().length < 2) {
          return "Name must be at least 2 characters long";
        }
        return null;

      case "email":
        if (!value.trim()) {
          return "Email address is required";
        }
        if (!isValidEmail(value)) {
          return "Please enter a valid email address";
        }
        return null;

      case "password":
        if (!value) {
          return "Password is required";
        }
        if (!isValidPassword(value)) {
          return "Password must be at least 6 characters long";
        }
        return null;

      case "confirmPassword":
        if (!value) {
          return "Please confirm your password";
        }
        if (value !== formData.password) {
          return "Passwords do not match";
        }
        return null;

      default:
        return null;
    }
  };

  // Handle input change with real-time validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear general error
    if (fieldErrors.general) {
      setFieldErrors((prev) => ({
        ...prev,
        general: undefined,
      }));
    }
  };

  // Handle field blur validation
  const handleFieldBlur = (fieldName: string, value: string) => {
    const error = validateField(fieldName, value);
    setFieldErrors((prev) => ({
      ...prev,
      [fieldName]: error || undefined,
    }));
  };

  // Validate all fields
  const validateAllFields = (): boolean => {
    const errors: FieldErrors = {};

    // Validate name
    const nameError = validateField("name", formData.name);
    if (nameError) errors.name = nameError;

    // Validate email
    const emailError = validateField("email", formData.email);
    if (emailError) errors.email = emailError;

    // Validate password
    const passwordError = validateField("password", formData.password);
    if (passwordError) errors.password = passwordError;

    // Validate confirm password
    const confirmPasswordError = validateField("confirmPassword", formData.confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!validateAllFields()) {
      return;
    }

    try {
      setIsButtonLoading(true);
      
      // Store registration data in sessionStorage and redirect to change password
      sessionStorage.setItem('registrationData', JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      }));
      
      router.push("/change-password");
    } catch (error) {
      // Handle server errors
      setFieldErrors({
        general: "Registration failed. Please try again.",
      });
    } finally {
      setIsButtonLoading(false);
    }
  };

  // Process auth context error to field-specific error
  useEffect(() => {
    if (error) {
      const errorMessage = error.toLowerCase();
      if (errorMessage.includes("email")) {
        setFieldErrors({ email: error });
      } else if (errorMessage.includes("password")) {
        setFieldErrors({ password: error });
      } else if (errorMessage.includes("name")) {
        setFieldErrors({ name: error });
      } else {
        setFieldErrors({ general: error });
      }
    }
  }, [error]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-800 relative overflow-hidden">
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
              Join the Future of Quality Assurance
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed">
              Create your account and start building better software with our
              advanced QA monitoring platform.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Quick Setup</h3>
                <p className="text-purple-100">
                  Get started in minutes with our intuitive onboarding process
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Powerful Features</h3>
                <p className="text-purple-100">
                  Advanced test management and comprehensive reporting tools
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Proven Results</h3>
                <p className="text-purple-100">
                  Reduce bugs by 60% and improve deployment confidence
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-purple-200">Active Teams</div>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-sm text-purple-200">Tests Executed</div>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-sm text-purple-200">Uptime</div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6 pt-8">
              <div className="flex items-center justify-center space-x-2 mb-6 lg:hidden">
                <Bug className="h-8 w-8 text-indigo-600" />
                <span className="text-2xl font-bold text-gray-900">
                  QAMonitorTool
                </span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Create Account
              </CardTitle>
              <p className="text-gray-600 mt-2">Join our QA testing platform</p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* General Error Alert */}
                {fieldErrors.general && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      {fieldErrors.general}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur("name", formData.name)}
                    placeholder="Enter your full name"
                    className={`h-11 transition-colors ${fieldErrors.name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      }`}
                    required
                  />
                  {fieldErrors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
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
                    onBlur={() => handleFieldBlur("email", formData.email)}
                    placeholder="Enter your email"
                    className={`h-11 transition-colors ${fieldErrors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      }`}
                    required
                  />
                  {fieldErrors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
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
                      onBlur={() => handleFieldBlur("password", formData.password)}
                      placeholder="Enter your password"
                      className={`h-11 pr-12 transition-colors ${fieldErrors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        }`}
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
                  {fieldErrors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur("confirmPassword", formData.confirmPassword)}
                      placeholder="Confirm your password"
                      className={`h-11 pr-12 transition-colors ${fieldErrors.confirmPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isButtonLoading}
                  className="w-full h-11 flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
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
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
