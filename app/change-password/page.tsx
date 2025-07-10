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
  Lock,
  Shield,
  CheckCircle,
  ArrowLeft,
  Key,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

// Field-specific error interface
interface FieldErrors {
  oldPassword?: string;
  newPassword?: string;
  general?: string;
}

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export default function ChangePasswordPage() {
  const { user, logout, isAuthenticated, register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRegistrationFlow, setIsRegistrationFlow] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if this is coming from registration flow
    const storedRegistrationData = sessionStorage.getItem('registrationData');
    if (storedRegistrationData) {
      setIsRegistrationFlow(true);
      setRegistrationData(JSON.parse(storedRegistrationData));
    } else if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Password strength validation
  const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Validate individual field
  const validateField = (fieldName: string, value: string): string | null => {
    switch (fieldName) {
      case "oldPassword":
        if (!value) {
          return isRegistrationFlow ? "Default password is required" : "Current password is required";
        }
        return null;

      case "newPassword":
        if (!value) {
          return "New password is required";
        }
        if (!isValidPassword(value)) {
          return "New password must be at least 6 characters long";
        }
        if (value === formData.oldPassword) {
          return "New password must be different from the default password";
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

    // Validate old password
    const oldPasswordError = validateField("oldPassword", formData.oldPassword);
    if (oldPasswordError) errors.oldPassword = oldPasswordError;

    // Validate new password
    const newPasswordError = validateField("newPassword", formData.newPassword);
    if (newPasswordError) errors.newPassword = newPasswordError;

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

      if (isRegistrationFlow && registrationData) {
        // Registration flow: verify old password matches registration password, then create account with new password
        if (formData.oldPassword !== registrationData.password) {
          setFieldErrors({ oldPassword: "Default password is incorrect" });
          return;
        }

        // Create account with new password
        await register(
          registrationData.name,
          registrationData.email,
          formData.newPassword,
          registrationData.role
        );

        // Clear registration data
        sessionStorage.removeItem('registrationData');
        
        setSuccess(true);
        
        // Redirect to login after success
        setTimeout(() => {
          router.push("/login?message=Account created successfully! Please login with your new password.");
        }, 2000);
        
      } else {
        // Normal password change flow for existing users
        const response = await axios.put("/api/auth/change-password", {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        });

        if (response.data.success) {
          setSuccess(true);
          setFormData({
            oldPassword: "",
            newPassword: "",
          });

          // Show success message for 2 seconds, then logout and redirect
          setTimeout(() => {
            logout();
            router.push("/login?message=Password changed successfully. Please login with your new password.");
          }, 2000);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to process request";
      
      // Handle specific error types
      if (errorMessage.includes("Current password is incorrect") || errorMessage.includes("password")) {
        setFieldErrors({ oldPassword: errorMessage });
      } else {
        setFieldErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything while checking authentication
  if (!isRegistrationFlow && !isAuthenticated) {
    return null;
  }

  const pageTitle = isRegistrationFlow ? "Set Your Password" : "Change Password";
  const pageDescription = isRegistrationFlow 
    ? `Complete your account setup for ${registrationData?.name}` 
    : `Update your account password for ${user?.name}`;
  const oldPasswordLabel = isRegistrationFlow ? "Default Password" : "Current Password";
  const oldPasswordPlaceholder = isRegistrationFlow ? "Enter the default password" : "Enter your current password";
  const submitButtonText = isRegistrationFlow ? "Create Account" : "Change Password";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-6 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 pt-8">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className={`rounded-full p-3 ${isRegistrationFlow ? 'bg-green-100' : 'bg-blue-100'}`}>
                {isRegistrationFlow ? (
                  <UserPlus className="h-8 w-8 text-green-600" />
                ) : (
                  <Key className="h-8 w-8 text-blue-600" />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {pageTitle}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {pageDescription}
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {isRegistrationFlow 
                    ? "Account created successfully! Redirecting to login..." 
                    : "Password changed successfully! Redirecting to login..."
                  }
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

              {/* Old/Default Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="oldPassword"
                  className="text-sm font-semibold text-gray-700"
                >
                  {oldPasswordLabel}
                </Label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    name="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    value={formData.oldPassword}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur("oldPassword", formData.oldPassword)}
                    placeholder={oldPasswordPlaceholder}
                    className={`h-11 pr-12 transition-colors ${
                      fieldErrors.oldPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showOldPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {fieldErrors.oldPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {fieldErrors.oldPassword}
                  </p>
                )}
              </div>

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
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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

              {/* Password Requirements */}
              <div className={`border rounded-lg p-4 ${isRegistrationFlow ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                <h4 className={`text-sm font-semibold mb-2 flex items-center ${isRegistrationFlow ? 'text-green-800' : 'text-blue-800'}`}>
                  <Shield className="h-4 w-4 mr-2" />
                  Password Requirements
                </h4>
                <ul className={`text-xs space-y-1 ${isRegistrationFlow ? 'text-green-700' : 'text-blue-700'}`}>
                  <li className="flex items-center">
                    <CheckCircle className={`h-3 w-3 mr-2 ${
                      formData.newPassword.length >= 6 ? "text-green-600" : "text-gray-400"
                    }`} />
                    At least 6 characters long
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className={`h-3 w-3 mr-2 ${
                      formData.newPassword && formData.newPassword !== formData.oldPassword ? "text-green-600" : "text-gray-400"
                    }`} />
                    Different from {isRegistrationFlow ? 'default' : 'current'} password
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={loading || success}
                className={`w-full h-11 flex justify-center items-center gap-2 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02] ${
                  isRegistrationFlow 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                }`}
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
                    <span>{isRegistrationFlow ? 'Creating Account...' : 'Changing Password...'}</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>{isRegistrationFlow ? 'Account Created!' : 'Password Changed!'}</span>
                  </>
                ) : (
                  <>
                    {isRegistrationFlow ? (
                      <UserPlus className="h-5 w-5" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                    <span>{submitButtonText}</span>
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href={isRegistrationFlow ? "/register" : "/dashboard"}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {isRegistrationFlow ? 'Back to Registration' : 'Back to Dashboard'}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}