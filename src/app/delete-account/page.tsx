export default function DeleteAccount() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-2">
            Delete Account
          </h1>
          <p className="text-gray-600 mb-12">
            Last updated: November 6, 2025
          </p>

          <div className="space-y-8 text-gray-700">
            <p>
              We understand that you may want to delete your Acture (Promisu) account. This page explains how to delete your account and what happens when you do.
            </p>

            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How to Delete Your Account
              </h2>
              <p className="mb-4">
                To delete your account, please follow these steps:
              </p>
              <ol className="list-decimal pl-6 space-y-2 mb-4">
                <li>Open the Acture (Promisu) app on your device</li>
                <li>Navigate to Settings or Account settings</li>
                <li>Select "Delete Account" or "Account Deletion"</li>
                <li>Follow the on-screen instructions to confirm deletion</li>
                <li>Alternatively, contact us at tmdwn12512@gmail.com to request account deletion</li>
              </ol>
              <p>
                We may require additional verification to ensure the account belongs to you before processing the deletion.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What Happens When You Delete Your Account
              </h2>
              <p className="mb-4">
                When you delete your account, the following will occur:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Your account and profile information will be permanently deleted</li>
                <li>All your habit tracking data, progress, and streaks will be removed</li>
                <li>Your goals and actions will be permanently deleted</li>
                <li>You will no longer be able to access the app with your previous credentials</li>
                <li>Any subscriptions or premium features associated with your account will be cancelled</li>
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                <p className="font-semibold text-yellow-900 mb-2">
                  ⚠️ Warning: This action cannot be undone
                </p>
                <p className="text-yellow-800">
                  Once your account is deleted, all data will be permanently removed and cannot be recovered. Please make sure you want to proceed before confirming the deletion.
                </p>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Data Retention After Deletion
              </h2>
              <p className="mb-4">
                After you request account deletion:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>We will process your deletion request within 30 days</li>
                <li>Some data may be retained for a limited period for legal or security purposes (e.g., transaction records, logs required by law)</li>
                <li>Anonymized or aggregated data that cannot be associated with you may be retained</li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Before You Delete
              </h2>
              <p className="mb-4">
                Before deleting your account, you may want to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Export or download your data (see our Data Deletion page for more information)</li>
                <li>Cancel any active subscriptions</li>
                <li>Save any important information or progress you want to keep</li>
                <li>Ensure you no longer need access to any features or data</li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="mb-4">
                If you have questions about account deletion or need assistance, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <p className="font-semibold text-gray-900">Acture (Promisu) Support</p>
                <p>
                  <span className="font-medium">📧 Email:</span>{" "}
                  <a href="mailto:tmdwn12512@gmail.com" className="text-blue-600 hover:text-blue-800 underline">
                    tmdwn12512@gmail.com
                  </a>
                </p>
                <p className="text-sm text-gray-600 mt-4">
                  Please include "Account Deletion Request" in the subject line when contacting us about account deletion.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

