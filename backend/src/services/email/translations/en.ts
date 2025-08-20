export const en = {
  emailVerification: {
    subject: "Verify Your Email - {appName}",
    title: "Verify Your Email Address",
    greeting: "Hi there! You're setting up email verification for your {appName} account. This will enable:",
    benefits: {
      crossDeviceSync: "Cross-device sync: Access your connections on any device",
      secureBackup: "Secure backup: Your data is safely stored in the cloud",
      accountRecovery: "Account recovery: Easily restore your data if you change phones"
    },
    actionText: "Click the button below to verify your email address:",
    verifyButton: "Verify Email Address",
    securityNote: "Security Note: This link will expire in 24 hours. If you didn't request this verification, you can safely ignore this email.",
    footer: {
      sentTo: "This email was sent to {email}",
      contact: "If you have any questions, contact us at kaloyan@bozhkov.com"
    }
  },
  emailVerificationPage: {
    title: "Email Verification - {appName}",
    success: {
      title: "✓ Email Verified!",
      message: "Your email has been successfully verified. Your account is now synced across devices.",
      openApp: "Open {appName} App",
      openAppDescription: "Click the button below to open the app and see your synced account:",
      openAppButton: "Open {appName}",
      downloadIos: "Download iOS App",
      downloadAndroid: "Download Android App"
    },
    error: {
      title: "Verification Failed",
      defaultMessage: "There was an error verifying your email address.",
      contactSupport: "Contact Support"
    },
    debug: {
      title: "Debug Info (Development Mode):",
      hostname: "Hostname: {hostname}",
      deepLink: "Deep Link: {deepLink}",
      note: "If the app doesn't open, make sure Expo is running and try clicking the link manually."
    }
  }
};
