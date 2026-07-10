import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Recommendation } from '../../types';
import { ClipboardList, User, Calendar, FileText } from 'lucide-react';

export const DoctorRecommendations: React.FC = () => {
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
        console.error('Error fetching doctor recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="space-y-6 selection:bg-brandBlue/35 selection:text-white transition-colors duration-200">
      <div>
        <h1 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Submitted Clinical Directives</h1>
        <p className="text-[11px] text-gray-500 dark:text-textSecondary font-semibold mt-0.5">
          History log of dietary advice, prescription guidelines, and care recommendations sent to patients.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <div className="w-10 h-10 border-3 border-brandBlue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-textSecondary font-semibold text-xs">Retrieving directives log...</p>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-xl rounded-2xl p-6 space-y-4 hover:border-brandBlue/15 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brandBlue/5 rounded-full blur-2xl pointer-events-none"></div>

              {/* Header Details */}
              <div className="space-y-2 relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList size={16} className="text-brandBlue shrink-0" />
                    <span>{rec.title}</span>
                  </h2>
                  <span className="text-[9px] text-gray-500 dark:text-textSecondary font-bold flex items-center gap-1 shrink-0 bg-slate-50 dark:bg-darkSidebar border border-gray-250 dark:border-darkBorder px-2.5 py-1 rounded-lg">
                    <Calendar size={10} />
                    {new Date(rec.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-[10px] text-gray-600 dark:text-textSecondary font-bold flex items-center gap-1.5">
                  <User size={12} className="text-brandBlue" />
                  <span>Patient Profile:</span>
                  <span className="text-gray-950 dark:text-white font-bold">{rec.patient?.name} ({rec.patient?.email})</span>
                </p>
              </div>

              {/* Detailed Guidelines content */}
              <div className="bg-slate-50 dark:bg-darkSidebar/65 border border-gray-200 dark:border-darkBorder/40 p-4 rounded-xl relative z-10 shadow-sm">
                <p className="text-xs text-gray-700 dark:text-textSecondary leading-relaxed font-semibold whitespace-pre-wrap">
                  {rec.description}
                </p>
              </div>

              {/* Verified Badge */}
              <div className="flex justify-between items-center pt-2 relative z-10 border-t border-gray-200 dark:border-darkBorder text-[9px] text-gray-500 dark:text-textSecondary/60 font-bold uppercase tracking-wider">
                <span>Direct Clinician Record</span>
                <span>Active Status</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl p-16 text-center text-gray-500 dark:text-textSecondary max-w-2xl mx-auto shadow-xl">
          <FileText size={32} className="text-gray-400 dark:text-textSecondary/40 mx-auto mb-3" />
          <p className="font-bold text-sm">No recommendations logged.</p>
          <p className="text-xs text-gray-400 dark:text-textSecondary/70 mt-1">
            Write your first directive from the "Patient Logs" directory by selecting any patient.
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorRecommendations;
