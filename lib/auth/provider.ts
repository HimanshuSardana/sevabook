export interface OTPProvider {
  sendOTP(phone: string): Promise<void>;
  verifyOTP(phone: string, otp: string): Promise<boolean>;
}

class MockOTPProvider implements OTPProvider {
  async sendOTP(_phone: string): Promise<void> {
    // In production, this would send via Twilio/MSG91/Exotel/AWS SNS
    console.log("[MockOTP] OTP sent (always 0000)");
  }

  async verifyOTP(_phone: string, otp: string): Promise<boolean> {
    return otp === "0000";
  }
}

// Swap implementation by changing this line or using env var
const providerType = process.env.AUTH_PROVIDER ?? "mock";

function createProvider(): OTPProvider {
  switch (providerType) {
    case "mock":
      return new MockOTPProvider();
    // future: case "twilio": return new TwilioProvider(...)
    default:
      throw new Error(`Unknown AUTH_PROVIDER: ${providerType}`);
  }
}

export const otpProvider = createProvider();
