export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto p-8 bg-base-100 shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold text-primary mb-6">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-4">
        Last updated: March 2nd, 2025
      </p>

      <div className="space-y-6">
        <p>
          By accessing and using this application, you agree to these Terms of
          Service. If you do not agree, please refrain from using the
          application.
        </p>

        <div className="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div className="collapse-title text-lg font-semibold">
            1. Use of the Application
          </div>
          <div className="collapse-content">
            <p>
              The application is designed to integrate with the MeldRx platform
              and provide AI-powered healthcare insights. You must comply with
              all relevant laws and regulations when using the application.
            </p>
          </div>
        </div>

        <div className="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div className="collapse-title text-lg font-semibold">
            2. Data and Privacy
          </div>
          <div className="collapse-content">
            <p>
              We do not store or share patient data beyond the session. Data is
              processed only with the user's explicit consent within the EHR
              system.
            </p>
          </div>
        </div>

        <div className="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div className="collapse-title text-lg font-semibold">
            3. Limitation of Liability
          </div>
          <div className="collapse-content">
            <p>
              The AI-generated insights provided by this application are for
              informational purposes only and should not be used as a substitute
              for professional medical advice. We are not liable for any
              decisions made based on the application's outputs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
