import { useState } from 'react';
import api from '../../lib/api';

export default function ProofModal({ isOpen, onClose, skill, onSubmit }) {
  const [proofUrl, setProofUrl] = useState('');
  const [proofType, setProofType] = useState('certificate');
  const [proofDescription, setProofDescription] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getProofPlaceholder = () => {
    const placeholders = {
      certificate: 'https://... (Certification URL, Credly, LinkedIn certificates)',
      portfolio: 'https://... (Portfolio website, GitHub, Behance, Dribbble)',
      testimonial: 'https://... (LinkedIn recommendations, testimonial page)',
      diploma: 'https://... (University profile, digital diploma link)',
      license: 'https://... (Professional licensing board verification)',
      video: 'https://... (YouTube, Vimeo, Loom - skill demonstration video)',
      other: 'https://... (Any relevant proof link)'
    };
    return placeholders[proofType] || placeholders.other;
  };

  const getProofHelperText = () => {
    const helperTexts = {
      certificate: 'Link to your certificate, certification badge, or credential verification page',
      portfolio: 'Link to your portfolio website, GitHub profile, or work samples online',
      testimonial: 'Link to testimonials, reviews, or references from clients/colleagues',
      diploma: 'Link to your degree credential, university verification, or educational certificate',
      license: 'Link to professional license verification or licensing board profile',
      video: 'Link to a video demonstrating your skill (YouTube, Vimeo, Loom, etc.)',
      other: 'Provide a link to any relevant online proof of your skill'
    };
    return helperTexts[proofType] || helperTexts.other;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only images (JPG, PNG, GIF) and PDF files are allowed');
        return;
      }
      setProofFile(file);
    }
  };

  const handleRemoveFile = () => {
    setProofFile(null);
    // Reset the file input
    const fileInput = document.getElementById('proof-file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!proofUrl && !proofDescription && !proofFile) {
      alert('Please provide either a proof link, description, or upload a file');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedFileUrl = null;

      // Upload file if selected
      if (proofFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('proofFile', proofFile);
        formData.append('skillId', skill.id);

        const uploadResponse = await fetch(`${api.API_BASE}/upload/proof`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${api.getToken()}`
          },
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        const uploadData = await uploadResponse.json();
        uploadedFileUrl = uploadData.fileUrl;
        setUploading(false);
      }

      await onSubmit(skill.id, {
        proofUrl: proofUrl.trim() || uploadedFileUrl || null,
        proofType,
        proofDescription: proofDescription.trim() || null
      });
      
      // Reset form
      setProofUrl('');
      setProofType('certificate');
      setProofDescription('');
      setProofFile(null);
      onClose();
    } catch (error) {
      alert('Failed to submit verification request: ' + error.message);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">verified_user</span>
            Verify Skill: {skill?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Skill Info */}
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Level: <span className="text-primary">{skill?.level?.charAt(0).toUpperCase() + skill?.level?.slice(1)}</span>
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Experience: <strong>{skill?.yearsOfExp || 0}</strong> years
            </p>
          </div>
          
          {/* Auto-verification status */}
          {((skill?.level === 'expert' && skill?.yearsOfExp >= 5) ||
            (['intermediate', 'advanced'].includes(skill?.level) && skill?.yearsOfExp >= 2)) && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <strong>Auto-Verification Eligible!</strong> Your skill will be automatically verified once proof is submitted.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Proof Type */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Proof Type *
            </label>
            <select
              value={proofType}
              onChange={(e) => setProofType(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
            >
              <option value="certificate">📜 Certificate / Certification</option>
              <option value="portfolio">💼 Portfolio / Work Samples</option>
              <option value="testimonial">💬 Testimonial / Reference</option>
              <option value="diploma">🎓 Diploma / Degree</option>
              <option value="license">✅ Professional License</option>
              <option value="video">🎥 Video Demonstration</option>
              <option value="other">📋 Other</option>
            </select>
          </div>

          {/* Proof URL */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Proof Link (Optional)
            </label>
            <input
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder={getProofPlaceholder()}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {getProofHelperText()}
            </p>
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Upload Proof File (Optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="proof-file-input"
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.gif,.pdf"
                className="hidden"
              />
              <label
                htmlFor="proof-file-input"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-semibold transition-colors border border-slate-300 dark:border-slate-600"
              >
                <span className="material-symbols-outlined text-lg">upload_file</span>
                Choose File
              </label>
              {proofFile && (
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">check_circle</span>
                        <span className="text-sm text-green-700 dark:text-green-300 font-medium truncate">
                          {proofFile.name}
                        </span>
                        <span className="text-xs text-green-600 dark:text-green-400 whitespace-nowrap">
                          ({(proofFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="ml-2 text-green-600 dark:text-green-400 hover:text-red-500 dark:hover:text-red-400"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Upload certificate, diploma, or proof document (JPG, PNG, GIF, PDF - Max 10MB)
            </p>
          </div>

          {/* Proof Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Proof Description *
            </label>
            <textarea
              value={proofDescription}
              onChange={(e) => setProofDescription(e.target.value)}
              placeholder="Describe your proof of skill. Examples:&#10;• Certificate from X organization in 2023&#10;• 5 years working as professional developer at ABC Corp&#10;• Portfolio with 20+ completed projects&#10;• Reference available from previous client"
              rows={6}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary resize-none"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">
              {proofDescription.length}/1000 characters
            </p>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
              <span className="material-symbols-outlined text-sm mt-0.5">info</span>
              <span>
                <strong>Why provide proof?</strong> Verified skills with credible proof build trust in the community and make you stand out in TownSquare. Your proof helps community members with high ratings verify your skills faster.
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading || (!proofUrl && !proofDescription && !proofFile)}
              className="flex-1 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">upload</span>
                  Uploading file...
                </>
              ) : submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">verified_user</span>
                  Submit for Verification
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
