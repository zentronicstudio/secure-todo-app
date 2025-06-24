// src/pages/VerifyPage.js
import { useEffect, useState } from "react";
import {
  auth,
  PhoneAuthProvider,
  signInWithCredential,
  initRecaptcha,
} from "../firebase";          // pastikan export ini semua dalam firebase.js

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState("");

  // ambil info user yang disimpan masa login
  const user = JSON.parse(localStorage.getItem("user"));

  // ---- Hantar OTP sebaik page mount ----
  useEffect(() => {
    if (!user?.phone) {
      alert("No phone number found.");
      return;
    }

    // 1) sediakan invisible reCAPTCHA
    const recaptcha = initRecaptcha("recaptcha-container");

    // 2) trigger OTP SMS
    const provider = new PhoneAuthProvider(auth);
    provider
      .verifyPhoneNumber(user.phone, recaptcha)
      .then((id) => {
        console.log("Verification ID:", id);
        setVerificationId(id);            // simpan ID utk verify nanti
      })
      .catch((err) => {
        console.error("OTP error:", err);
        alert("Failed to send OTP – " + err.message);
      });
  }, [user]);

  // ---- Verify OTP bila user tekan butang ----
  const handleVerify = async () => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);

      alert("Phone verified!");
      window.location.href = "/tasks";   // redirect ke page to-do
    } catch (err) {
      console.error("Verification failed:", err);
      alert("OTP salah atau expired");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h2>OTP Verification Page</h2>
      <p>Masukkan OTP yang dihantar ke <strong>{user?.phone}</strong></p>

      <input
        type="text"
        placeholder="Enter OTP"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <br /><br />

      <button onClick={handleVerify}>Verify</button>

      {/* reCAPTCHA perlu ada walau invisible */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
