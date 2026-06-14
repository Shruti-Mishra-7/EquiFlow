import React, { useState } from 'react';
import { auth } from './firebase-config';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import emailjs from '@emailjs/browser'; // Import added for security alerts

const Login = ({ setIsAdmin }) => { // Added setIsAdmin prop to connect to your dashboard
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  // 1. Setup the invisible reCAPTCHA (Firebase requirement)
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  };

  // 2. Function to Send SMS
  const onSignup = (e) => {
    e.preventDefault();
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;

    signInWithPhoneNumber(auth, phone, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setShowOtpInput(true);
        alert("OTP sent to " + phone);
      }).catch((error) => {
        console.error("Error sending SMS:", error);
        alert("Failed to send OTP. Check console.");
      });
  };

  // 3. Function to Verify the 6-digit code + Send Security Alert
  const onOTPVerify = (e) => {
    e.preventDefault();
    window.confirmationResult.confirm(otp)
      .then(async (result) => {
        alert("Login Successful! Welcome Admin.");
        console.log("User details:", result.user);
        
        // --- START SECURITY ALERT LOGIC ---
        const userAgent = navigator.userAgent;
        let systemName = "Unknown System";
        if (userAgent.includes("Windows NT 10.0")) systemName = "Windows 10/11";
        else if (userAgent.includes("Mac OS X")) systemName = "Mac OS";
        else if (userAgent.includes("Android")) systemName = "Android";
        else if (userAgent.includes("iPhone")) systemName = "iPhone";

        const isNewDevice = !localStorage.getItem('known_device');
        const securityStatus = isNewDevice ? "⚠️ UNAUTHORIZED/NEW DEVICE" : "AUTHORIZED DEVICE";
        
        const securityData = {
            official_email: "head-official@smc.gov.in", // Change to your head's email
            login_user: phone,
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            device_info: `${systemName} (Chrome/Edge)`,
            status: securityStatus,
            lock_url: `https://equiflow-smc.web.app/admin/lock?target=${phone}`
        };

        // Send alert to Official via EmailJS
        emailjs.send(
            "service_u7gokr6", 
            "template_security_alert", 
            securityData, 
            "vjt5N7npAhyJL-mhP"
        ).then(() => console.log("Security Alert Sent to Head."));

        if (isNewDevice) localStorage.setItem('known_device', 'true');
        // --- END SECURITY ALERT LOGIC ---

        // Persistence and Dashboard Entry
        localStorage.setItem('equiflow_auth', 'true');
        if(setIsAdmin) setIsAdmin(true); 

      }).catch((error) => {
        alert("Invalid OTP. Try again.");
      });
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#0f172a', minHeight: '100vh', color: 'white' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '900', fontStyle: 'italic' }}>EquiFlow Admin Portal</h2>
      <div id="recaptcha-container"></div> {/* Important! */}

      {!showOtpInput ? (
        <form onSubmit={onSignup}>
          <input 
            type="text" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="+91 9999999999"
            style={{ padding: '15px', width: '280px', borderRadius: '10px', border: '1px solid #334155', background: '#1e293b', color: 'white' }}
          />
          <button type="submit" style={{ marginLeft: '10px', padding: '15px 25px', borderRadius: '10px', background: '#2563eb', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={onOTPVerify}>
          <input 
            type="text" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            placeholder="Enter 6-digit OTP"
            style={{ padding: '15px', width: '280px', borderRadius: '10px', border: '1px solid #334155', background: '#1e293b', color: 'white', textAlign: 'center', letterSpacing: '5px', fontSize: '1.2rem' }}
          />
          <button type="submit" style={{ marginLeft: '10px', padding: '15px 25px', borderRadius: '10px', background: '#059669', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
            Verify & Login
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;