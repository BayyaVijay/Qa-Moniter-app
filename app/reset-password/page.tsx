"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Lock,
  Shield,
  CheckCircle,
  ArrowLeft,
  Key,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

// Field-specific error interface
interface FieldErrors {
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get reset token from session storage
    const token = sessionStorage.getItem('resetToken');
    console.log('Checking for reset token:', token);
    
    if (!token) {
      console.log('No reset token found, redirecting to forgot password');
      router.push('/forgot-password');
      return;
    }
    
    console.log('Reset token found, setting up form');
    setResetToken(token);
  }, [router]);

  // Password strength validation
  const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Validate individual field
  const validateField = (fieldName: string, value: string): string | null => {
    switch (fieldName) {
      case "newPassword":
        if (!value) {
          return "New password is required";
        }
        if (!isValidPassword(value)) {
          return "New password must be at least 6 characters long";
        }
        return null;

      case "confirmPassword":
        if (!value) {
          return "Please confirm your password";
        }
        if (value !== formData.newPassword) {
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

    // Clear success message
    if (success) {
      setSuccess(false);
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

    // Validate new password
    const newPasswordError = validateField("newPassword", formData.newPassword);
    if (newPasswordError) errors.newPassword = newPasswordError;

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
      setLoading(true);
      setFieldErrors({});

      const response = await axios.post("/api/auth/reset-password", {
        resetToken,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (response.data.success) {
        setSuccess(true);
        
        // Clear the reset token
        sessionStorage.removeItem('resetToken');
        
        // Redirect to login after success
        setTimeout(() => {
          router.push("/login?message=Password reset successfully! Please login with your new password.");
        }, 2000);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to reset password";
      
      // Handle specific error types
      if (errorMessage.includes("password") && errorMessage.includes("match")) {
        setFieldErrors({ confirmPassword: errorMessage });
      } else if (errorMessage.includes("password")) {
        setFieldErrors({ newPassword: errorMessage });
      } else {
        setFieldErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return null; // Will redirect to forgot password page
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-6 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 pt-8">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="bg-green-100 rounded-full p-3">
                <Key className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Reset Your Password
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Enter your new password below
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Password reset successfully! Redirecting to login...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* General Error Alert */}
              {fieldErrors.general && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {fieldErrors.general}
                  </AlertDescription>
                </Alert>
              )}

              {/* New Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="text-sm font-semibold text-gray-700"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur("newPassword", formData.newPassword)}
                    placeholder="Enter your new password"
                    className={`h-11 pr-12 transition-colors ${
                      fieldErrors.newPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-green-500 focus:ring-green-500"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {fieldErrors.newPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-gray-700"
                >
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur("confirmPassword", formData.confirmPassword)}
                    placeholder="Confirm your new password"
                    className={`h-11 pr-12 transition-colors ${
                      fieldErrors.confirmPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-green-500 focus:ring-green-500"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

              {/* Password Requirements */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center text-green-800">
                  <Shield className="h-4 w-4 mr-2" />
                  Password Requirements
                </h4>
                <ul className="text-xs space-y-1 text-green-700">
                  <li className="flex items-center">
                    <CheckCircle className={`h-3 w-3 mr-2 ${
                      formData.newPassword.length >= 6 ? "text-green-600" : "text-gray-400"
                    }`} />
                    At least 6 characters long
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className={`h-3 w-3 mr-2 ${
                      formData.newPassword && formData.newPassword === formData.confirmPassword ? "text-green-600" : "text-gray-400"
                    }`} />
                    Passwords match
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={loading || success}
                className="w-full h-11 flex justify-center items-center gap-2 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02] bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {loading ? (
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
                    <span>Resetting Password...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Password Reset!</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    <span>Reset Password</span>
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}