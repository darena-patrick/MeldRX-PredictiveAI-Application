export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">Last updated: [Insert Date]</p>

      <p className="mb-4">
        Your privacy is important to us. This Privacy Policy explains how we
        collect, use, disclose, and safeguard your information when you use our
        application, which integrates with MeldRx within the EHR system.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        1. Information We Collect
      </h2>
      <p className="mb-4">
        We collect patient health data, including condition and observation
        data, only when explicitly authorized by the user within the EHR system.
        No personal health data is stored beyond the session duration.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        2. How We Use Your Information
      </h2>
      <p className="mb-4">
        The data is analyzed to generate AI-powered insights, including risk
        scores, recommended actions, and preventive measures. We do not share,
        sell, or use patient data beyond the intended functionality of our
        application.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">3. Data Security</h2>
      <p className="mb-4">
        We implement strict security measures to protect patient data. All data
        processing occurs within a secure environment, and we comply with
        applicable healthcare privacy regulations.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        4. Your Rights and Choices
      </h2>
      <p className="mb-4">
        Users have the right to access, review, and delete their data as
        permitted by the EHR system.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        5. Changes to This Privacy Policy
      </h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. Any changes will be
        communicated within the application.
      </p>
    </div>
  );
}
