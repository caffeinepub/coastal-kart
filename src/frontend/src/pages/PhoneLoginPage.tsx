import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { usePhoneAuth } from "../hooks/usePhoneAuth";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function PhoneLoginPage() {
  const { login } = usePhoneAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const handleSendOTP = () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      setPhoneError("Please enter a valid 10-digit phone number");
      return;
    }
    setPhoneError("");
    const newOTP = generateOTP();
    setGeneratedOTP(newOTP);
    setStep("otp");
  };

  const handleVerify = () => {
    if (otp !== generatedOTP) {
      setOtpError("Incorrect OTP. Please try again.");
      return;
    }
    login(phone);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo + App name */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <img
            src="/assets/generated/coastal-kart-logo-transparent.dim_120x120.png"
            alt="Coastal Kart"
            className="w-20 h-20 object-contain mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-foreground">Coastal Kart</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fresh groceries from your local shop
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "phone" ? (
            <motion.div
              key="phone-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border shadow-md">
                <CardContent className="pt-6 pb-6 px-6 space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Enter your phone number
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      We'll send an OTP to verify your number
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone-input">Phone Number</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center justify-center bg-muted border border-border rounded-md px-3 text-sm text-muted-foreground font-medium flex-shrink-0">
                        +91
                      </div>
                      <Input
                        id="phone-input"
                        type="tel"
                        inputMode="numeric"
                        placeholder="9876543210"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => {
                          setPhone(
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          );
                          setPhoneError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                        className="flex-1"
                        data-ocid="phone_login.input"
                      />
                    </div>
                    {phoneError && (
                      <p
                        className="text-xs text-destructive"
                        data-ocid="phone_login.error_state"
                      >
                        {phoneError}
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    onClick={handleSendOTP}
                    data-ocid="phone_login.submit_button"
                  >
                    Send OTP
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border shadow-md">
                <CardContent className="pt-6 pb-6 px-6 space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Enter OTP
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sent to +91 {phone}
                    </p>
                  </div>

                  {/* Show OTP on screen since no SMS */}
                  <div
                    className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3"
                    data-ocid="phone_login.otp_display"
                  >
                    <p className="text-xs text-amber-700 font-medium">
                      Demo mode — your OTP is:
                    </p>
                    <p className="text-xl font-bold text-amber-900 tracking-widest mt-0.5">
                      {generatedOTP}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Enter 6-digit OTP</Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(val) => {
                          setOtp(val);
                          setOtpError("");
                        }}
                        data-ocid="phone_login.otp_input"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    {otpError && (
                      <p
                        className="text-xs text-destructive text-center"
                        data-ocid="phone_login.otp_error_state"
                      >
                        {otpError}
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    onClick={handleVerify}
                    disabled={otp.length !== 6}
                    data-ocid="phone_login.verify_button"
                  >
                    Verify & Continue
                  </Button>

                  <button
                    type="button"
                    className="w-full text-sm text-primary hover:underline text-center"
                    onClick={() => {
                      setStep("phone");
                      setOtp("");
                      setOtpError("");
                    }}
                    data-ocid="phone_login.change_number.button"
                  >
                    ← Change number
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
