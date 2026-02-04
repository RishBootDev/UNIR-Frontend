import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { profileService } from "@/services/api";
import { Navbar } from "@/components/Navbar/Navbar";
import { Spinner } from "@/components/ui/Spinner";
import { User, MapPin, Briefcase, Mail, Link as LinkIcon, Calendar, Building2, School, X } from "lucide-react";

export default function PublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfileById(userId);
      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile", err);
      setError("Profile not found or private.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#f3f2ef]">
        <Navbar />
        <div className="pt-[80px] max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-800">Profile Unavailable</h1>
            <p className="text-gray-500 mt-2">{error}</p>
            <button onClick={() => navigate('/feed')} className="mt-4 unir-btn-primary">Go to Feed</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar />
      <div className="pt-[72px] max-w-[1128px] mx-auto px-4 pb-10">
        
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
            <div className="h-[200px] w-full bg-slate-700 relative">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
            </div>
            
            <div className="px-6 pb-6 relative">
                 <div className="-mt-[80px] mb-4 relative z-10 inline-block">
                    <div className="w-[160px] h-[160px] rounded-full border-[4px] border-white shadow-md overflow-hidden bg-white">
                        {profile.profilePictureUrl ? (
                            <img src={profile.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                <User className="w-20 h-20 text-slate-400" />
                            </div>
                        )}
                    </div>
                 </div>

                 <div className="flex justify-between items-start">
                     <div>
                         <h1 className="text-2xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h1>
                         <p className="text-gray-700 mt-1 text-lg">{profile.headline}</p>
                         
                         <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                             {profile.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>}
                             {profile.industry && <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {profile.industry}</span>}
                             {profile.contactInfo && (
                                <div className="flex gap-3">
                                    {profile.contactInfo.email && <a href={`mailto:${profile.contactInfo.email}`} className="text-blue-600 hover:underline">Contact Info</a>}
                                </div>
                             )}
                         </div>
                     </div>
                     <div className="flex gap-2 mt-4">
                         <button className="unir-btn-primary px-6">Connect</button>
                         <button className="px-4 py-1.5 border border-slate-400 rounded-full font-semibold hover:bg-slate-50 transition">Message</button>
                     </div>
                 </div>

                 {/* Highlights */}
                 <div className="mt-6 flex gap-4">
                     {profile.topKeywords && profile.topKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                             {Array.from(profile.topKeywords).map((k, i) => (
                                 <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold">#{k}</span>
                             ))}
                        </div>
                     )}
                 </div>
            </div>
        </div>

        {/* Content Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column (Main Info) */}
            <div className="md:col-span-2 space-y-4">
                
                {/* About */}
                {profile.summary && (
                    <div className="unir-card p-6">
                        <h2 className="text-xl font-bold mb-3">About</h2>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{profile.summary}</p>
                    </div>
                )}

                {/* Experience */}
                {profile.experiences && profile.experiences.length > 0 && (
                    <div className="unir-card p-6">
                        <h2 className="text-xl font-bold mb-4">Experience</h2>
                        <div className="space-y-6">
                            {profile.experiences.map((exp, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="w-12 h-12 bg-white border border-gray-100 shadow-sm rounded-lg flex items-center justify-center shrink-0">
                                         {exp.company?.logoUrl ? <img src={exp.company.logoUrl} className="w-8 h-8 object-contain" /> : <Building2 className="w-6 h-6 text-gray-400" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{exp.title}</h3>
                                        <p className="text-sm text-gray-700">{exp.company?.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {exp.startDate} - {exp.endDate || "Present"}
                                        </p>
                                        {exp.location && <p className="text-xs text-gray-500">{exp.location}</p>}
                                        {exp.description && <p className="text-sm text-gray-600 mt-2">{exp.description}</p>}
                                        {exp.technologies && exp.technologies.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {Array.from(exp.technologies).map((t, idx) => (
                                                    <span key={idx} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{t}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {profile.educations && profile.educations.length > 0 && (
                    <div className="unir-card p-6">
                        <h2 className="text-xl font-bold mb-4">Education</h2>
                        <div className="space-y-6">
                             {profile.educations.map((edu, i) => (
                                <div key={i} className="flex gap-4">
                                     <div className="w-12 h-12 bg-white border border-gray-100 shadow-sm rounded-lg flex items-center justify-center shrink-0">
                                         {edu.institution?.logoUrl ? <img src={edu.institution.logoUrl} className="w-8 h-8 object-contain" /> : <School className="w-6 h-6 text-gray-400" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{edu.institution?.name}</h3>
                                        <p className="text-sm text-gray-700">{edu.degree}, {edu.fieldOfStudy}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{edu.startYear} - {edu.endYear}</p>
                                        {edu.grade && <p className="text-xs text-gray-500">Grade: {edu.grade}</p>}
                                    </div>
                                </div>
                             ))}
                        </div>
                    </div>
                )}
                
                 {/* Projects */}
                 {profile.projects && profile.projects.length > 0 && (
                    <div className="unir-card p-6">
                        <h2 className="text-xl font-bold mb-4">Projects</h2>
                        <div className="space-y-6">
                             {profile.projects.map((proj, i) => (
                                <div key={i}>
                                    <h3 className="font-bold text-gray-900">{proj.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{proj.description}</p>
                                    <div className="flex gap-3 mt-2 text-sm text-blue-600">
                                        {proj.repoUrl && <a href={proj.repoUrl} target="_blank" className="hover:underline">View Code</a>}
                                        {proj.demoUrl && <a href={proj.demoUrl} target="_blank" className="hover:underline">View Demo</a>}
                                    </div>
                                </div>
                             ))}
                        </div>
                    </div>
                )}

            </div>

            {/* Right Column */}
            <div className="space-y-4">
                 {/* Skills */}
                 {profile.skills && profile.skills.length > 0 && (
                    <div className="unir-card p-6">
                        <h2 className="text-lg font-bold mb-3">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 transition cursor-default">
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Languages */}
                {profile.languages && profile.languages.length > 0 && (
                    <div className="unir-card p-6">
                        <h2 className="text-lg font-bold mb-3">Languages</h2>
                        <ul className="space-y-2">
                             {profile.languages.map((lang, i) => (
                                 <li key={i} className="text-sm text-gray-700 border-b border-gray-50 pb-2 last:border-0">
                                     <span className="font-semibold block">{lang.name}</span>
                                     <span className="text-gray-500 text-xs">{lang.proficiency}</span>
                                 </li>
                             ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
