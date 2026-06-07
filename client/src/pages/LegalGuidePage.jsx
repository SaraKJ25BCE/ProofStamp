import { Link } from 'react-router-dom';
import LegalLayout from './LegalLayout';
import { MARKETING, TSA_BADGES, BSA_FRAME } from '@/content/legalCopy';

export default function LegalGuidePage() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  return (
    <LegalLayout title="India Admissibility Guide">
      <p>
        This guide explains what ProofStamp produces and what it does <strong>not</strong> replace.
        Always consult a qualified advocate for your specific dispute.
      </p>

      <h2 className="text-xl font-bold text-white mt-8 mb-4">What ProofStamp provides</h2>
      <table className="w-full text-left border border-white/10 rounded-xl overflow-hidden text-sm mb-8">
        <thead className="bg-white/5 text-white/90">
          <tr>
            <th className="p-4 font-semibold border-b border-white/10">Artifact</th>
            <th className="p-4 font-semibold border-b border-white/10">Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            <td className="p-4 align-top font-medium text-white/90">SHA-256 fingerprint</td>
            <td className="p-4 text-white/70">Proves the file you registered matches a specific byte sequence</td>
          </tr>
          <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            <td className="p-4 align-top font-medium text-white/90">RSA-2048 signature</td>
            <td className="p-4 text-white/70">Binds the stamp to your Passport identity at registration time</td>
          </tr>
          <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            <td className="p-4 align-top font-medium text-white/90">RFC 3161 timestamp</td>
            <td className="p-4 text-white/70">Independent time witness from a Timestamp Authority (not ProofStamp&apos;s clock alone)</td>
          </tr>
          <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            <td className="p-4 align-top font-medium text-white/90">{BSA_FRAME.shortLabel}</td>
            <td className="p-4 text-white/70">Describes the computer system output under {BSA_FRAME.act} — not authorship or ownership</td>
          </tr>
          <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            <td className="p-4 align-top font-medium text-white/90">Creator declaration</td>
            <td className="p-4 text-white/70">Your attested statement of authorship/rights (separate from system certificate)</td>
          </tr>
          <tr className="hover:bg-white/[0.02] transition-colors">
            <td className="p-4 align-top font-medium text-white/90">{MARKETING.counselPacketName}</td>
            <td className="p-4 text-white/70">ZIP for your advocate: proof JSON, both PDFs, TSA token, affidavit template, FOR_YOUR_ADVOCATE.md</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-xl font-bold text-white mt-8 mb-4">TSA tiers</h2>
      <table className="w-full text-left border border-white/10 rounded-xl overflow-hidden text-sm mb-8">
        <thead className="bg-white/5 text-white/90">
          <tr>
            <th className="p-4 font-semibold border-b border-white/10">Mode</th>
            <th className="p-4 font-semibold border-b border-white/10">Badge</th>
            <th className="p-4 font-semibold border-b border-white/10">When to use</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            <td className="p-4 align-top font-medium text-white/90">development (default)</td>
            <td className="p-4 align-top">{TSA_BADGES.development}</td>
            <td className="p-4 text-white/70">Configured public TSA (e.g. FreeTSA). Suitable for development and many pre-litigation workflows.</td>
          </tr>
          <tr className="hover:bg-white/[0.02] transition-colors">
            <td className="p-4 align-top font-medium text-white/90">production</td>
            <td className="p-4 align-top">{TSA_BADGES.production}</td>
            <td className="p-4 text-white/70">Commercial TSA URL with <code className="text-xs bg-black/40 px-1.5 py-0.5 rounded border border-white/10 text-white/80">TSA_MODE=production</code>. Your advocate may prefer this for high-stakes disputes.</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-xl font-bold text-white mt-12 mb-4">What ProofStamp is not</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Not</strong> a replacement for Copyright Office registration (Section 48 prima facie in India)</li>
        <li><strong>Not</strong> a guarantee you will win in court or on social platforms</li>
        <li><strong>Not</strong> automatic removal of infringing content — you file notices yourself</li>
        <li><strong>Not</strong> legal advice</li>
      </ul>

      <h2 className="text-xl font-bold text-white mt-12 mb-4">API: artifacts per stamp</h2>
      <p className="mb-4">
        For any public Stamp ID, see the catalog of claims and download URLs:
      </p>
      <code className="block bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-mono text-white/80 break-all mb-8">
        GET {apiUrl}/legal/PS-YYYY-XXXXX/artifacts
      </code>

      <h2 className="text-xl font-bold text-white mt-12 mb-4">Recommended use</h2>
      <ol className="list-decimal pl-6 space-y-2">
        <li>Stamp work before you publish or share widely</li>
        <li>Complete creator declaration attestation on the stamp page</li>
        <li>Download the {MARKETING.counselPacketName} and store offline</li>
        <li>Enable monitoring for images you publish online ({MARKETING.monitoringLanding})</li>
        <li>When infringed, file DMCA with the packet attached</li>
        <li>
          For maximum ownership presumption in India, also consider{' '}
          <Link to="/register-copyright" className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors font-medium">Copyright Office registration</Link>
        </li>
      </ol>
    </LegalLayout>
  );
}
