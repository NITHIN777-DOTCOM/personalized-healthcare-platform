import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Recommendation } from '../../types';
import { ClipboardList, Award, Calendar, FileText } from 'lucide-react';

export const PatientRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await api.get('/recommendations');
        if (response.data?.success) {
          setRecommendations(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="space-y-6 selection:bg-brandBlue/35 selection:text-white transition-colors duration-200">
      <div>
        <h1 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Clinician Care Recommendations</h1>
        <p className="text-[11px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">
          Review personalized dietary plans, prescriptions, exercise targets, and recovery guidelines.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <div className="w-10 h-10 border-3 border-brandBlue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-textSecondary font-semibold text-xs">Retrieving recommendations...</p>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-xl rounded-2xl p-6 space-y-4 hover:border-brandBlue/20 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brandBlue/5 rounded-full blur-2xl pointer-events-none"></div>
              
              {/* Header */}
              <div className="space-y-2 relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList size={16} className="text-brandBlue shrink-0" />
                    <span>{rec.title}</span>
                  </h2>
                  <span className="text-[9px] text-gray-500 dark:text-textSecondary font-bold flex items-center gap-1.5 shrink-0 bg-slate-50 dark:bg-darkSidebar border border-gray-250 dark:border-darkBorder px-2.5 py-1 rounded-lg">
                    <Calendar size={10} />
                    {new Date(rec.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-[10px] text-gray-600 dark:text-textSecondary font-bold">
                  Prescribed by:{' '}
                  <span className="text-gray-900 dark:text-white">Dr. {rec.doctor?.name}</span> (
                  {rec.doctor?.doctorProfile?.specialization || 'Clinical Specialist'})
                </p>
              </div>

              {/* Guidelines Box */}
              <div className="bg-slate-50 dark:bg-darkSidebar/65 border border-gray-200 dark:border-darkBorder/40 p-4 rounded-xl relative z-10 shadow-sm">
                <p className="text-xs text-gray-700 dark:text-textSecondary leading-relaxed font-semibold whitespace-pre-wrap">
                  {rec.description}
                </p>
              </div>

              {/* Footer info badge */}
              <div className="flex justify-between items-center pt-2 relative z-10 border-t border-gray-200 dark:border-darkBorder text-[10px] text-gray-500 dark:text-textSecondary/60 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1 text-[9px]">
                  <Award size={12} className="text-brandBlue" />
                  Verified Clinician Signature
                </span>
                <span>License: {rec.doctor?.doctorProfile?.licenseNumber || 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl p-12 text-center text-gray-500 dark:text-textSecondary max-w-2xl mx-auto shadow-xl">
          <FileText size={32} className="text-gray-400 dark:text-textSecondary/40 mx-auto mb-3" />
          <p className="font-bold text-sm">No care recommendations found.</p>
          <p className="text-xs text-gray-400 dark:text-textSecondary/70 mt-1">
            Once a consulting clinician submits a treatment plan, dietary guide, or prescription, it will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default PatientRecommendations;
