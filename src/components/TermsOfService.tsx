import { Helmet } from "react-helmet-async";

export default function TermsOfService() {
  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 md:px-12 py-12 flex flex-col gap-8">
      <Helmet>
        <title>Terms of Service - Skywaves Educare</title>
        <meta name="description" content="Terms of Service for Skywaves Educare." />
      </Helmet>
      
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600 text-lg">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing or using the Skywaves Educare website and services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Educational Services</h2>
          <p>
            Skywaves Educare provides educational courses, training, and related materials. The content is for informational and educational purposes only. We reserve the right to modify, suspend, or discontinue any course or service without prior notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property</h2>
          <p>
            The service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Skywaves Educare and its licensors. The service is protected by copyright, trademark, and other laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Conduct</h2>
          <p>
            You agree not to use the service in any way that causes, or may cause, damage to the service or impairment of the availability or accessibility of the service, or in any way which is unlawful, illegal, fraudulent, or harmful.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
          <p>
            In no event shall Skywaves Educare, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us through our website.
          </p>
        </section>
      </div>
    </div>
  );
}
