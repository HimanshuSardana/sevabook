"use client";

import { useState, useRef } from "react";
import { sendOTP, verifyOTP } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

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
      otpRefs[0].current?.focus();
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
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">SevaBook</CardTitle>
        <CardDescription>
          {step === "phone"
            ? "Enter your phone number to log in"
            : "Enter the OTP sent to your phone"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "phone" ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="9999999999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label>OTP</Label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <Input
                    key={i}
                    ref={otpRefs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="h-12 w-12 text-center text-lg"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    disabled={loading}
                    required
                  />
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Login"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={() => {
                setStep("phone");
                setError("");
                setOtp(["", "", "", ""]);
              }}
            >
              Change phone number
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
