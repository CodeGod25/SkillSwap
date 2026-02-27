import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import TopNav from '../components/stitch/TopNav';
import ProofModal from '../components/stitch/ProofModal';
import api from '../lib/api';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    lat: '',
    lng: '',
    radiusKm: 5,
    offeredSkills: [],
    neededSkills: [],
  });
  const [newSkill, setNewSkill] = useState({ name: '', kind: 'offer' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedSkillForProof, setSelectedSkillForProof] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
      setFormData({
        name: userData.name || '',
        lat: userData.lat || '',
        lng: userData.lng || '',
        radiusKm: userData.radiusKm || 5,
        offeredSkills: userData.skills?.filter((s) => s.kind === 'offer') || [],
        neededSkills: userData.skills?.filter((s) => s.kind === 'need') || [],
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to load user:', error);
      router.push('/login');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6),
          });
          alert('Location detected successfully!');
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to detect location. Please enable location services or enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) return;

    const skillWithDefaults = {
      ...newSkill,
      level: newSkill.level || 'beginner',
      yearsOfExp: newSkill.yearsOfExp || 0,
    };

    if (newSkill.kind === 'offer') {
      setFormData({
        ...formData,
        offeredSkills: [...formData.offeredSkills, skillWithDefaults],
      });
    } else {
      setFormData({
        ...formData,
        neededSkills: [...formData.neededSkills, skillWithDefaults],
      });
    }

    setNewSkill({ name: '', kind: 'offer', level: 'beginner', yearsOfExp: 0 });
  };

  const handleRemoveSkill = (index, kind) => {
    if (kind === 'offer') {
      setFormData({
        ...formData,
        offeredSkills: formData.offeredSkills.filter((_, i) => i !== index),
      });
    } else {
      setFormData({
        ...formData,
        neededSkills: formData.neededSkills.filter((_, i) => i !== index),
      });
    }
  };

  const handleRequestVerification = async (skill) => {
    setSelectedSkillForProof(skill);
    setProofModalOpen(true);
  };

  const handleSubmitProof = async (skillId, proofData) => {
    try {
      const result = await api.requestSkillVerification(skillId, proofData);
      if (result.status === 'auto-verified') {
        alert(`✅ ${result.message}`);
      } else if (result.status === 'pending') {
        alert('🔄 Verification request submitted with proof! A community member with high rating will review your skill.');
      }
      loadUser(); // Reload to show updated verification status
    } catch (error) {
      console.error('Failed to request verification:', error);
      throw error;
    }
  };

  const handleAIVerification = async (skillId, skillName) => {
    if (!confirm(`Use AI to analyze and verify "${skillName}"?\n\nAI will review your proof and may automatically verify if confidence is high.`)) {
      return;
    }

    try {
      const response = await fetch(`${api.API_BASE}/skills/${skillId}/ai-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.getToken()}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`❌ ${result.error || 'AI verification failed'}\n${result.message || ''}`);
        return;
      }

      if (result.status === 'verified') {
        alert(`🤖✅ ${result.message}\n\n${result.analysis.reasoning}`);
      } else {
        const { recommendation, confidence, reasoning, suggestions } = result.analysis;
        let message = `🤖 AI Analysis Complete\n\n`;
        message += `Recommendation: ${recommendation}\n`;
        message += `Confidence: ${confidence}\n\n`;
        message += `Reasoning: ${reasoning}\n`;
        if (suggestions) {
          message += `\nSuggestions: ${suggestions}`;
        }
        alert(message);
      }

      loadUser(); // Reload to show updated verification status
    } catch (error) {
      console.error('AI verification failed:', error);
      alert('❌ Failed to perform AI verification. Please try again later.');
    }
  };

  const checkAutoVerificationEligibility = (skill) => {
    const level = skill.level || 'beginner';
    const years = parseInt(skill.yearsOfExp) || 0;
    
    if (level === 'expert' && years >= 5) {
      return { eligible: true, reason: 'Expert with 5+ years' };
    }
    if ((level === 'intermediate' || level === 'advanced') && years >= 2) {
      return { eligible: true, reason: 'Intermediate/Advanced with 2+ years' };
    }
    return { eligible: false, reason: null };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const skills = [
        ...formData.offeredSkills.map((s) => ({ 
          name: s.name, 
          kind: 'offer',
          level: s.level || 'beginner',
          yearsOfExp: parseInt(s.yearsOfExp) || 0
        })),
        ...formData.neededSkills.map((s) => ({ name: s.name, kind: 'need' })),
      ];

      await api.updateMe({
        name: formData.name,
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
        radiusKm: parseInt(formData.radiusKm),
        skills,
      });

      // Check for auto-verification eligible skills
      const autoVerifyEligible = formData.offeredSkills.filter(s => 
        !s.isVerified && !s.id && checkAutoVerificationEligibility(s).eligible
      );

      let message = '✅ Profile updated successfully!';
      if (autoVerifyEligible.length > 0) {
        message += `\n\n🎯 ${autoVerifyEligible.length} skill(s) eligible for auto-verification! Click "Get Verified" after saving to verify: ${autoVerifyEligible.map(s => s.name).join(', ')}`;
      }

      alert(message);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Profile - SkillSwap</title>
      </Head>

      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <TopNav user={user} />

        <main className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Latitude{' '}
                      <span className="text-xs text-slate-400">(optional)</span>
                    </label>
                    <input
                      name="lat"
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={handleChange}
                      placeholder="40.7580"
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Longitude{' '}
                      <span className="text-xs text-slate-400">(optional)</span>
                    </label>
                    <input
                      name="lng"
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={handleChange}
                      placeholder="-73.9855"
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-xl transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">my_location</span>
                  <span>Use My Current Location</span>
                </button>

                <div>
                  <label className="block text-sm font-medium mb-2">Search Radius (km)</label>
                  <input
                    name="radiusKm"
                    type="number"
                    value={formData.radiusKm}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Skills offered */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">workspace_premium</span>
                  Skills I Offer
                </h2>
                {formData.offeredSkills.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold">
                      {formData.offeredSkills.filter(s => s.isVerified).length} verified
                    </span>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-semibold">
                      {formData.offeredSkills.length} total
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-3 mb-4">
                {formData.offeredSkills.map((skill, i) => (
                  <div
                    key={i}
                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-slate-900 dark:text-white">{skill.name}</span>
                          {skill.isVerified && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full"
                              title={skill.verifiedBy ? `Verified by community member` : 'Verified'}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>verified</span>
                              Verified
                            </span>
                          )}
                          {skill.verificationStatus === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-semibold rounded-full">
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                              Pending
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <select
                            value={skill.level || 'beginner'}
                            onChange={(e) => {
                              const updated = [...formData.offeredSkills];
                              updated[i].level = e.target.value;
                              setFormData({ ...formData, offeredSkills: updated });
                            }}
                            className="text-xs px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600"
                          >
                            <option value="beginner">🌱 Beginner</option>
                            <option value="intermediate">📚 Intermediate</option>
                            <option value="advanced">🎯 Advanced</option>
                            <option value="expert">⭐ Expert</option>
                          </select>
                          <input
                            type="number"
                            value={skill.yearsOfExp || 0}
                            onChange={(e) => {
                              const updated = [...formData.offeredSkills];
                              updated[i].yearsOfExp = parseInt(e.target.value) || 0;
                              setFormData({ ...formData, offeredSkills: updated });
                            }}
                            placeholder="Years"
                            min="0"
                            max="50"
                            className="text-xs px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 w-20"
                          />
                          <span className="text-xs text-slate-500">years exp</span>
                          
                          {/* Auto-verify eligibility indicator for existing skills */}
                          {!skill.isVerified && skill.verificationStatus !== 'pending' && checkAutoVerificationEligibility(skill).eligible && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
                              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>check_circle</span>
                              Auto-verify ready
                            </span>
                          )}
                          
                          {/* Show verification button for saved skills */}
                          {skill.id && !skill.isVerified && skill.verificationStatus !== 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleRequestVerification(skill)}
                              className="inline-flex items-center gap-1 text-xs px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>verified_user</span>
                              Get Verified
                            </button>
                          )}

                          {/* Show AI Verify button for skills with proof pending verification */}
                          {skill.id && !skill.isVerified && skill.verificationStatus === 'pending' && (skill.proofUrl || skill.proofDescription) && (
                            <button
                              type="button"
                              onClick={() => handleAIVerification(skill.id, skill.name)}
                              className="inline-flex items-center gap-1 text-xs px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors"
                              title="Use AI to analyze your proof"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>psychology</span>
                              AI Verify
                            </button>
                          )}
                          
                          {/* Show "Save first" indicator for new skills */}
                          {!skill.id && !skill.isVerified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded">
                              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>save</span>
                              Save first to verify
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(i, 'offer')}
                        className="text-slate-400 hover:text-red-500 text-xl"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Skill */}
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary">add_circle</span>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Add New Skill</h3>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newSkill.kind === 'offer' ? newSkill.name : ''}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value, kind: 'offer' })}
                    placeholder="e.g., Guitar Lessons, Python Programming, Carpentry"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary text-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={newSkill.level || 'beginner'}
                      onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-sm"
                    >
                      <option value="beginner">🌱 Beginner</option>
                      <option value="intermediate">📚 Intermediate</option>
                      <option value="advanced">🎯 Advanced</option>
                      <option value="expert">⭐ Expert</option>
                    </select>
                    <input
                      type="number"
                      value={newSkill.yearsOfExp || 0}
                      onChange={(e) => setNewSkill({ ...newSkill, yearsOfExp: parseInt(e.target.value) || 0 })}
                      placeholder="Years of experience"
                      min="0"
                      max="50"
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newSkill.name.trim()) {
                        alert('Please enter a skill name');
                        return;
                      }
                      setNewSkill({ ...newSkill, kind: 'offer' });
                      setTimeout(handleAddSkill, 0);
                    }}
                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-slate-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Add Skill
                  </button>
                  <p className="text-xs text-slate-500 text-center">
                    💡 Add your skill, then click "Save Changes" below. After saving, you can verify it.
                  </p>
                </div>
              </div>
            </div>

            {/* Skills needed */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold mb-4">Skills I Need</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.neededSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-orange-100 dark:bg-orange-900/20 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium flex items-center gap-2"
                  >
                    {skill.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(i, 'need')}
                      className="text-slate-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill.kind === 'need' ? newSkill.name : ''}
                  onChange={(e) => setNewSkill({ name: e.target.value, kind: 'need' })}
                  placeholder="e.g., Plumbing"
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setNewSkill({ ...newSkill, kind: 'need' });
                    setTimeout(handleAddSkill, 0);
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl font-medium text-sm hover:bg-orange-600"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-primary hover:bg-primary/90 text-slate-900 font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>
      
      {/* Proof Modal */}
      <ProofModal
        isOpen={proofModalOpen}
        onClose={() => {
          setProofModalOpen(false);
          setSelectedSkillForProof(null);
        }}
        skill={selectedSkillForProof}
        onSubmit={handleSubmitProof}
      />
    </>
  );
}
