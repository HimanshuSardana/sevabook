"use client";

import { useState, useRef } from "react";
import { sendOTP, verifyOTP } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Phone, KeyRound, BookOpen, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await sendOTP(phone);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setStep("otp");
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const code = otp.join("");
    if (code.length !== 4) {
      setError("Please enter the complete OTP");
      setLoading(false);
      return;
    }

    const res = await verifyOTP(phone, code);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
      setOtp(["", "", "", ""]);
      otpRefs[0].current?.focus();
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      {/* Brand */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-sm">
          <BookOpen className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">SevaBook</h1>
        <p className="text-sm text-muted-foreground">
          Service business management
        </p>
      </div>

      <Card className="w-full border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">
            {step === "phone" ? "Welcome back" : "Enter OTP"}
          </CardTitle>
          <CardDescription>
            {step === "phone"
              ? "Enter your phone number to log in"
              : `Enter the 4-digit code sent to ${phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9999999999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-3">
                <Label className="text-center text-sm">OTP</Label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, i) => (
                    <Input
                      key={i}
                      ref={otpRefs[i]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="h-14 w-14 text-center text-xl font-semibold"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      disabled={loading}
                      required
                    />
                  ))}
                </div>
              </div>
              {error && (
                <p className="text-center text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loading}
              >
                <KeyRound className="h-4 w-4" />
                {loading ? "Verifying..." : "Verify & Login"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full gap-2 text-sm text-muted-foreground"
                onClick={() => {
                  setStep("phone");
                  setError("");
                  setOtp(["", "", "", ""]);
                }}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Change phone number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Demo: 9999999999 · OTP: 0000
      </p>
    </div>
  );
}
