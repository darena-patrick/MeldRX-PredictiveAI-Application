export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-base-100 shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold text-primary mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-4">
        Last updated: March 2nd, 2025
      </p>

      <div className="space-y-6">
        <p>
          Your privacy is important to us. This Privacy Policy explains how we
          collect, use, disclose, and safeguard your information when you use
          our application, which integrates with MeldRx within the EHR system.
        </p>

        <div className="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div className="collapse-title text-lg font-semibold">
            1. Information We Collect
          </div>
          <div className="collapse-content">
            <p>
              We collect patient health data, including condition and
              observation data, only when explicitly authorized by the user
              within the EHR system. No personal health data is stored beyond
              the session duration.
            </p>
          </div>
        </div>

        <div className="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div className="collapse-title text-lg font-semibold">
            2. How We Use Your Information
          </div>
          <div className="collapse-content">
            <p>
              The data is analyzed to generate AI-powered insights, including
              risk scores, recommended actions, and preventive measures. We do
              not share, sell, or use patient data beyond the intended
              functionality of our application.
            </p>
          </div>
        </div>

        <div className="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div className="collapse-title text-lg font-semibold">
            3. Data Security
          </div>
          <div className="collapse-content">
            <p>
              We implement strict security measures to protect patient data. All
              data processing occurs within a secure environment, and we comply
              with applicable healthcare privacy regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
