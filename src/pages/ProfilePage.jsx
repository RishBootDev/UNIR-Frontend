import { Navbar } from "@/components/Navbar/Navbar";
import { useAuth } from "@/context/useAuth";
import { Camera, Pencil, Briefcase, GraduationCap, Award, ExternalLink, Globe, Mail, Phone, Link as LinkIcon, Twitter, Linkedin, Github, X, Plus } from "lucide-react";
import { SubscriptionCard } from "@/components/Subscription/SubscriptionCard";
import { useState, useEffect } from "react";
import { profileService, companyService, institutionService, postsService } from "@/services/api";
import { Post } from "@/components/Feed/Post";

// --- REUSABLE COMPONENTS ---

const AsyncSelect = ({ label, onSelect, placeholder, service, value }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      try {
        const data = await service.search(query);
        setResults(data || []);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, service]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value || query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (value) onSelect(null);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      {isOpen && results.length > 0 && (
        <ul className="absolute z-[100] w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-40 overflow-auto">
          {results.map((item, index) => (
            <li
              key={index}
              onClick={() => {
                onSelect(item);
                setQuery(item.name);
                setIsOpen(false);
              }}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              <div className="font-medium">{item.name}</div>
              {item.location && <div className="text-xs text-gray-500">{item.location}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Input = ({ label, value, onChange, placeholder, type = "text", className = "" }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    />
  </div>
);

const FormModal = ({ title, isOpen, onClose, onSave, children, isSubmitting }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-90">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto space-y-6">
                    {children}
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button onClick={onClose} className="unir-btn-secondary !px-8">Cancel</button>
                    <button onClick={onSave} disabled={isSubmitting} className="unir-btn-primary !px-10">
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'experience', 'education', 'skill', 'project', 'certification'
  
  // Form States
  const [expForm, setExpForm] = useState({ title: "", company: null, startDate: "", endDate: "", description: "", employmentType: "FULL_TIME", technologies: "" });
  const [eduForm, setEduForm] = useState({ institution: null, degree: "", fieldOfStudy: "", startYear: "", endYear: "", grade: "", description: "" });
  const [skillForm, setSkillForm] = useState({ name: "", proficiency: "INTERMEDIATE" });
  const [projForm, setProjForm] = useState({ name: "", role: "", description: "", technologies: "", startDate: "", endDate: "", repoUrl: "", demoUrl: "" });
  const [certForm, setCertForm] = useState({ name: "", date: "", credentialUrl: "" });
  const [langForm, setLangForm] = useState({ name: "", proficiency: "PROFESSIONAL_WORKING" });
  const [basicForm, setBasicForm] = useState({ firstName: "", lastName: "", headline: "", location: "", industry: "", profilePictureUrl: "" });
  const [aboutForm, setAboutForm] = useState("");
  const [keywordsForm, setKeywordsForm] = useState("");
  const [contactForm, setContactForm] = useState({ phone: "", website: "", linkedin: "", github: "", twitter: "" });
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    if (profile?.userId) {
        postsService.getUserPosts(profile.userId).then(data => {
            setUserPosts(data.content || []);
        }).catch(err => console.error("Failed to load user posts", err));
    }
  }, [profile?.userId]);

  // Force fetch profile if missing on mount
  useEffect(() => {
    if (!profile && user?.id) {
        console.log("Profile missing in context, force refreshing...");
        refreshProfile();
    }
  }, [profile, user?.id, refreshProfile]);

  // Populate basic, about, and contact forms when profile loads
  useEffect(() => {
    if (profile) {
        setBasicForm({
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            headline: profile.headline || "",
            location: profile.location || "",
            industry: profile.industry || "",
            profilePictureUrl: profile.profilePictureUrl || ""
        });
        setAboutForm(profile.summary || "");
        setKeywordsForm(profile.topKeywords ? (Array.isArray(profile.topKeywords) ? profile.topKeywords.join(", ") : Array.from(profile.topKeywords).join(", ")) : "");
        setContactForm({
            phone: profile.contactInfo?.phone || "",
            website: profile.contactInfo?.website || "",
            linkedin: profile.contactInfo?.linkedin || "",
            github: profile.contactInfo?.github || "",
            twitter: profile.contactInfo?.twitter || ""
        });
    }
  }, [profile]);

  // Helper to format date strings (e.g. 2023-01-01 -> Jan 2023)
  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const handleSaveItem = async (type) => {
    setIsSubmitting(true);
    try {
        let payload;
        switch(type) {
            case 'experience':
                payload = { ...expForm, technologies: expForm.technologies ? expForm.technologies.split(",").map(s => s.trim()).filter(Boolean) : [] };
                await profileService.addExperience(payload);
                setExpForm({ title: "", company: null, startDate: "", endDate: "", description: "", employmentType: "FULL_TIME", technologies: "" });
                break;
            case 'education':
                payload = { ...eduForm, startYear: eduForm.startYear ? parseInt(eduForm.startYear) : null, endYear: eduForm.endYear ? parseInt(eduForm.endYear) : null };
                await profileService.addEducation(payload);
                setEduForm({ institution: null, degree: "", fieldOfStudy: "", startYear: "", endYear: "", grade: "", description: "" });
                break;
            case 'skill':
                await profileService.addSkill(skillForm);
                setSkillForm({ name: "", proficiency: "INTERMEDIATE" });
                break;
            case 'project':
                payload = { ...projForm, technologies: projForm.technologies ? projForm.technologies.split(",").map(s => s.trim()).filter(Boolean) : [] };
                await profileService.addProject(payload);
                setProjForm({ name: "", role: "", description: "", technologies: "", startDate: "", endDate: "", repoUrl: "", demoUrl: "" });
                break;
            case 'certification':
                await profileService.addCertification(certForm);
                setCertForm({ name: "", date: "", credentialUrl: "" });
                break;
            case 'language':
                await profileService.addLanguage(langForm);
                setLangForm({ name: "", proficiency: "PROFESSIONAL_WORKING" });
                break;
            case 'basic':
                await profileService.createProfile({ ...profile, ...basicForm });
                break;
            case 'about':
                await profileService.createProfile({ ...profile, summary: aboutForm });
                break;
            case 'keywords':
                // Assuming backend has a keyword endpoint or we update via createProfile
                const keywordList = keywordsForm.split(",").map(s => s.trim()).filter(Boolean);
                await profileService.createProfile({ ...profile, topKeywords: keywordList });
                break;
            case 'contact':
                await profileService.updateContact({ ...profile.contactInfo, ...contactForm });
                break;
        }
        await refreshProfile();
        setActiveModal(null);
    } catch (err) {
        console.error(`Failed to save ${type}:`, err);
        alert(`Failed to save ${type}. Please try again.`);
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderSection = (title, items, renderItem, icon, type) => (
    <div className="unir-card mt-3 p-8 unir-card-hover group/section">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover/section:bg-blue-600 group-hover/section:text-white transition-all duration-300">
                {icon}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setActiveModal(type)} className="p-2 rounded-xl hover:bg-blue-50 text-blue-600 transition-all border border-transparent hover:border-blue-100 active:scale-90">
                <Plus className="w-6 h-6" />
            </button>
            <button className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 transition-all border border-transparent hover:border-slate-100 active:scale-90">
                <Pencil className="w-5 h-5" />
            </button>
        </div>
      </div>
      {items && items.length > 0 ? (
        <div className="space-y-8">
          {items.map((item, index) => (
            <div key={index} className="group/item">
                {renderItem(item)}
                {index < items.length - 1 && <div className="border-b border-slate-50 mt-8" />}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-sm text-slate-400 font-medium font-medium">No {title.toLowerCase()} added yet.</p>
            <button onClick={() => setActiveModal(type)} className="mt-3 text-sm text-blue-600 font-bold hover:underline">
                + Add your first {title.toLowerCase()}
            </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f2ee]">
      <Navbar />
      <div className="pt-[52px]">
        <div className="max-w-[1128px] mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 max-w-[790px]">
              {/* Header Card */}
              <div className="unir-card overflow-hidden unir-card-hover">
                <div className="relative">
                  <div className="h-[200px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700">
                      <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
                  </div>
                  <button className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl hover:bg-white/40 transition-all active:scale-95 group">
                    <Camera className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                <div className="px-8 pb-8 -mt-[88px] relative z-20">
                  <div className="flex justify-between items-end">
                    <div className="relative">
                        <img
                          src={profile?.profilePictureUrl || user?.avatar || "https://static.licdn.com/aero-v1/networks/ghost-finder/ghost-person.612aaaff.png"}
                          alt="Profile"
                          className="w-[160px] h-[160px] rounded-[2.5rem] border-8 border-white object-cover bg-white shadow-xl"
                        />
                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm" />
                    </div>
                    <button onClick={() => setActiveModal('basic')} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100 active:scale-90 group">
                      <Pencil className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                    </button>
                  </div>
                  <div className="mt-6">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {profile ? `${profile.firstName} ${profile.lastName}` : user?.name}
                    </h1>
                    <p className="text-lg text-slate-600 mt-1 font-medium leading-relaxed max-w-2xl">{profile?.headline || user?.headline || "No headline added"}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-slate-500 font-semibold">
                        {profile?.location && <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {profile.location}</span>}
                        {profile?.industry && <span className="flex items-center gap-1">• {profile.industry}</span>}
                        <button 
                            onClick={() => setShowContactModal(true)}
                            className="text-blue-600 font-bold hover:underline"
                        >
                            Contact Details
                        </button>
                    </div>
                    <p className="text-sm font-bold text-blue-600 mt-2 bg-blue-50 w-fit px-3 py-1 rounded-lg">{profile?.connections?.length || 0} Professional Connections</p>
                  </div>
                  <div className="flex gap-3 mt-8">
                    <button className="unir-btn-primary shadow-blue-500/30">
                      Open to work
                    </button>
                    <button className="unir-btn-secondary">
                      Add section
                    </button>
                    <button className="p-2.5 border-2 border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95">
                      More
                    </button>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="unir-card mt-3 p-8 unir-card-hover group/about">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Professional Summary</h2>
                    <button onClick={() => setActiveModal('about')} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 transition-all border border-transparent hover:border-slate-100 active:scale-90 opacity-0 group-hover/about:opacity-100">
                        <Pencil className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-base text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {profile?.summary || "Share your professional story to attract recruiters and partners."}
                </p>
              </div>

              {/* Experience Section */}
              {renderSection("Experience", profile?.experiences, (exp) => (
                <div className="flex gap-5">
                  <div className="w-14 h-14 flex-shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center ring-1 ring-slate-100 group-hover/item:scale-105 transition-transform">
                    {exp.company?.logoUrl ? (
                         <img src={exp.company.logoUrl} alt={exp.company.name} className="w-full h-full object-contain p-2" />
                    ) : <Briefcase className="w-6 h-6 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{exp.title}</h3>
                    <p className="text-sm font-bold text-slate-600 mt-1">{exp.company?.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">
                            {formatDate(exp.startDate)} — {formatDate(exp.endDate)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[11px] text-blue-500 font-bold uppercase tracking-wider">{exp.employmentType?.replace('_', ' ')}</span>
                    </div>
                    {exp.description && <p className="text-sm text-slate-500 mt-3 leading-relaxed">{exp.description}</p>}
                    {exp.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {exp.technologies.map((tech, i) => (
                                <span key={i} className="text-[10px] px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg font-bold uppercase tracking-wider">{tech}</span>
                            ))}
                        </div>
                    )}
                  </div>
                </div>
              ), <Briefcase className="w-6 h-6" />, 'experience')}

              {/* Education Section */}
              {renderSection("Education", profile?.educations, (edu) => (
                <div className="flex gap-5 group/edu">
                  <div className="w-14 h-14 flex-shrink-0 bg-blue-50 rounded-2xl flex items-center justify-center ring-1 ring-blue-100 group-hover/edu:scale-105 transition-transform">
                    {edu.institution?.logoUrl ? (
                        <img src={edu.institution.logoUrl} alt={edu.institution.name} className="w-full h-full object-contain p-2" />
                    ) : <GraduationCap className="w-6 h-6 text-indigo-500" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{edu.institution?.name}</h3>
                    <p className="text-sm font-bold text-slate-600 mt-1">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">
                            Class of {edu.endYear || "Present"}
                        </span>
                        {edu.grade && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="text-[11px] text-indigo-500 font-bold uppercase tracking-wider">Grade: {edu.grade}</span>
                            </>
                        )}
                    </div>
                  </div>
                </div>
              ), <GraduationCap className="w-6 h-6" />, 'education')}

              {/* Skills Section */}
              <div className="unir-card mt-3 p-8 unir-card-hover group/skills">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover/skills:bg-indigo-600 group-hover/skills:text-white transition-all">
                            <Award className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Skills & Expertise</h2>
                    </div>
                  <div className="flex gap-2">
                    <button onClick={() => setActiveModal('skill')} className="p-2 rounded-xl hover:bg-indigo-50 text-indigo-600 transition-all border border-transparent hover:border-indigo-100 active:scale-90">
                        <Plus className="w-6 h-6" />
                    </button>
                    <button className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 transition-all border border-transparent hover:border-slate-100 active:scale-90 opacity-0 group-hover/skills:opacity-100">
                        <Pencil className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {profile?.skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {profile.skills.map((skill, index) => (
                        <div key={index} className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 group/skill hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all cursor-default">
                            <div>
                                <p className="text-sm font-bold text-slate-800 tracking-tight">{skill.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{skill.proficiency}</p>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 group-hover/skill:scale-150 transition-transform" />
                        </div>
                      ))}
                    </div>
                ) : (
                    <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                        <p className="text-sm text-slate-400 font-medium">No skills listed yet.</p>
                        <button onClick={() => setActiveModal('skill')} className="mt-2 text-sm text-indigo-600 font-bold hover:underline">+ Add skill</button>
                    </div>
                )}
              </div>

               {/* Projects Section */}
               {renderSection("Featured Projects", profile?.projects, (proj) => (
                <div className="group/proj">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight group-hover/proj:text-blue-600 transition-colors">{proj.name}</h3>
                            <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">{proj.role}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                                    {formatDate(proj.startDate)} — {proj.endDate ? formatDate(proj.endDate) : "PRESENT"}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {proj.repoUrl && (
                                <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-900 text-white rounded-xl hover:scale-110 transition-transform shadow-lg shadow-black/10">
                                    <Github className="w-4 h-4" />
                                </a>
                            )}
                            {proj.demoUrl && (
                                <a href={proj.demoUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-blue-600 text-white rounded-xl hover:scale-110 transition-transform shadow-lg shadow-blue-500/10">
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-4 leading-relaxed line-clamp-3">{proj.description}</p>
                    {proj.technologies && (
                        <div className="flex flex-wrap gap-2 mt-5">
                            {proj.technologies.map((tech, i) => (
                                <span key={i} className="text-[10px] px-3 py-1.5 bg-white text-slate-600 font-bold rounded-lg border border-slate-100 shadow-sm hover:border-blue-100 transition-all">
                                    {tech.trim()}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
              ), <Briefcase className="w-6 h-6" />, 'project')}

              {/* Certifications Section */}
              {renderSection("Certifications", profile?.certifications, (cert) => (
                <div className="flex gap-5 group/cert">
                  <div className="w-14 h-14 flex-shrink-0 bg-amber-50 rounded-2xl flex items-center justify-center ring-1 ring-amber-100 group-hover/cert:scale-105 transition-transform">
                    <Award className="w-8 h-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{cert.name}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-1">Issued {formatDate(cert.date)}</p>
                    {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="mt-4 unir-btn-secondary !py-2 !px-5 !text-xs group/btn shadow-sm">
                            Verify Credential <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </a>
                    )}
                  </div>
                </div>
              ), <Award className="w-6 h-6" />, 'certification')}

              <SubscriptionCard />
            </div>

            {/* Right Sidebar - Dynamic placeholder */}
            <div className="hidden lg:block w-[300px]">
                <div className="unir-card p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-[rgba(0,0,0,0.9)]">Profile Language</h3>
                        <button onClick={() => setActiveModal('language')} className="p-1 hover:bg-gray-100 rounded-full text-blue-600">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {profile?.languages?.length > 0 ? (
                            profile.languages.map((lang, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span className="text-[rgba(0,0,0,0.7)]">{lang.name}</span>
                                    <span className="text-xs text-[rgba(0,0,0,0.5)]">{lang.proficiency}</span>
                                </div>
                            ))
                        ) : <span className="text-sm text-gray-400">Not specified</span>}
                    </div>
                </div>
                {profile?.topKeywords && profile.topKeywords.length > 0 && (
                    <div className="unir-card p-4 mb-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-[rgba(0,0,0,0.9)]">Keywords</h3>
                            <button onClick={() => setActiveModal('keywords')} className="p-1 hover:bg-gray-100 rounded-full">
                                <Pencil className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Array.from(profile.topKeywords).map((keyword, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">#{keyword}</span>
                            ))}
                        </div>
                    </div>
                )}
                <div className="unir-card p-4">
                    <h3 className="font-semibold text-[rgba(0,0,0,0.9)] mb-3">People also viewed</h3>
                    <p className="text-sm text-gray-500 italic">No suggestions available at the moment.</p>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modals */}
      <FormModal 
        title="Add Experience" 
        isOpen={activeModal === 'experience'} 
        onClose={() => setActiveModal(null)} 
        onSave={() => handleSaveItem('experience')}
        isSubmitting={isSubmitting}
      >
        <AsyncSelect label="Company" service={companyService} value={expForm.company?.name} onSelect={c => setExpForm({...expForm, company: c})} />
        <Input label="Title" placeholder="Software Engineer" value={expForm.title} onChange={v => setExpForm({...expForm, title: v})} />
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                <select className="w-full px-3 py-2 border rounded-md text-sm" value={expForm.employmentType} onChange={e => setExpForm({...expForm, employmentType: e.target.value})}>
                    <option value="FULL_TIME">Full Time</option><option value="PART_TIME">Part Time</option><option value="CONTRACT">Contract</option><option value="INTERNSHIP">Internship</option><option value="FREELANCE">Freelance</option><option value="TEMPORARY">Temporary</option>
                </select>
            </div>
            <Input label="Location" placeholder="City, Country" value={expForm.location} onChange={v => setExpForm({...expForm, location: v})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <Input type="date" label="Start Date" value={expForm.startDate} onChange={v => setExpForm({...expForm, startDate: v})} />
            <Input type="date" label="End Date" value={expForm.endDate} onChange={v => setExpForm({...expForm, endDate: v})} />
        </div>
        <Input label="Technologies (comma separated)" placeholder="React, Node.js..." value={expForm.technologies} onChange={v => setExpForm({...expForm, technologies: v})} />
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="w-full px-3 py-2 border rounded-md text-sm" value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} />
        </div>
      </FormModal>

      <FormModal 
        title="Add Education" 
        isOpen={activeModal === 'education'} 
        onClose={() => setActiveModal(null)} 
        onSave={() => handleSaveItem('education')}
        isSubmitting={isSubmitting}
      >
        <AsyncSelect label="Institution" service={institutionService} value={eduForm.institution?.name} onSelect={i => setEduForm({...eduForm, institution: i})} />
        <Input label="Degree" placeholder="Bachelor's" value={eduForm.degree} onChange={v => setEduForm({...eduForm, degree: v})} />
        <Input label="Field of Study" placeholder="Computer Science" value={eduForm.fieldOfStudy} onChange={v => setEduForm({...eduForm, fieldOfStudy: v})} />
        <div className="grid grid-cols-2 gap-4">
            <Input label="Start Year" placeholder="2018" value={eduForm.startYear} onChange={v => setEduForm({...eduForm, startYear: v})} />
            <Input label="End Year" placeholder="2022" value={eduForm.endYear} onChange={v => setEduForm({...eduForm, endYear: v})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <Input label="Grade" placeholder="3.8 GPA" value={eduForm.grade} onChange={v => setEduForm({...eduForm, grade: v})} />
            <Input label="Description" value={eduForm.description} onChange={v => setEduForm({...eduForm, description: v})} />
        </div>
      </FormModal>

      <FormModal 
        title="Add Skill" 
        isOpen={activeModal === 'skill'} 
        onClose={() => setActiveModal(null)} 
        onSave={() => handleSaveItem('skill')}
        isSubmitting={isSubmitting}
      >
        <Input label="Skill name" placeholder="JavaScript" value={skillForm.name} onChange={v => setSkillForm({...skillForm, name: v})} />
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency</label>
            <select className="w-full px-3 py-2 border rounded-md text-sm" value={skillForm.proficiency} onChange={e => setSkillForm({...skillForm, proficiency: e.target.value})}>
                <option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="ADVANCED">Advanced</option><option value="EXPERT">Expert</option>
            </select>
        </div>
      </FormModal>

      <FormModal 
        title="Add Project" 
        isOpen={activeModal === 'project'} 
        onClose={() => setActiveModal(null)} 
        onSave={() => handleSaveItem('project')}
        isSubmitting={isSubmitting}
      >
        <Input label="Project Name" placeholder="E-commerce App" value={projForm.name} onChange={v => setProjForm({...projForm, name: v})} />
        <Input label="Role" placeholder="Frontend Developer" value={projForm.role} onChange={v => setProjForm({...projForm, role: v})} />
        <div className="grid grid-cols-2 gap-4">
            <Input type="date" label="Start Date" value={projForm.startDate} onChange={v => setProjForm({...projForm, startDate: v})} />
            <Input type="date" label="End Date" value={projForm.endDate} onChange={v => setProjForm({...projForm, endDate: v})} />
        </div>
        <Input label="Repository URL" placeholder="https://github.com/..." value={projForm.repoUrl} onChange={v => setProjForm({...projForm, repoUrl: v})} />
        <Input label="Demo URL" placeholder="https://..." value={projForm.demoUrl} onChange={v => setProjForm({...projForm, demoUrl: v})} />
        <Input label="Technologies (comma separated)" placeholder="React, Tailwind..." value={projForm.technologies} onChange={v => setProjForm({...projForm, technologies: v})} />
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="w-full px-3 py-2 border rounded-md text-sm" value={projForm.description} onChange={e => setProjForm({...projForm, description: e.target.value})} />
        </div>
      </FormModal>

      <FormModal 
        title="Add Certification" 
        isOpen={activeModal === 'certification'} 
        onClose={() => setActiveModal(null)} 
        onSave={() => handleSaveItem('certification')}
        isSubmitting={isSubmitting}
      >
        <Input label="Certification Name" placeholder="AWS Certified Developer" value={certForm.name} onChange={v => setCertForm({...certForm, name: v})} />
        <Input type="date" label="Date Obtained" value={certForm.date} onChange={v => setCertForm({...certForm, date: v})} />
        <Input label="Credential URL" placeholder="https://..." value={certForm.credentialUrl} onChange={v => setCertForm({...certForm, credentialUrl: v})} />
      </FormModal>

      <FormModal 
        title="Add Language" 
        isOpen={activeModal === 'language'} 
        onClose={() => setActiveModal(null)} 
        onSave={() => handleSaveItem('language')}
        isSubmitting={isSubmitting}
      >
        <Input label="Language" placeholder="English" value={langForm.name} onChange={v => setLangForm({...langForm, name: v})} />
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency</label>
            <select className="w-full px-3 py-2 border rounded-md text-sm" value={langForm.proficiency} onChange={e => setLangForm({...langForm, proficiency: e.target.value})}>
                <option value="ELEMENTARY">Elementary</option>
                <option value="LIMITED_WORKING">Limited Working</option>
                <option value="PROFESSIONAL_WORKING">Professional Working</option>
                <option value="FULL_PROFESSIONAL">Full Professional</option>
                <option value="NATIVE_OR_BILINGUAL">Native or Bilingual</option>
            </select>
        </div>
      </FormModal>

      <FormModal 
        title="Edit Basic Info" 
        isOpen={activeModal === 'basic'} 
        onClose={() => setActiveModal(null)} 
        onSave={() => handleSaveItem('basic')}
        isSubmitting={isSubmitting}
      >
        <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={basicForm.firstName} onChange={v => setBasicForm({...basicForm, firstName: v})} />
            <Input label="Last Name" value={basicForm.lastName} onChange={v => setBasicForm({...basicForm, lastName: v})} />
        </div>
        <Input label="Headline" value={basicForm.headline} onChange={v => setBasicForm({...basicForm, headline: v})} />
        <div className="grid grid-cols-2 gap-4">
            <Input label="Location" value={basicForm.location} onChange={v => setBasicForm({...basicForm, location: v})} />
            <Input label="Industry" value={basicForm.industry} onChange={v => setBasicForm({...basicForm, industry: v})} />
        </div>
        <Input label="Profile Picture URL" value={basicForm.profilePictureUrl} onChange={v => setBasicForm({...basicForm, profilePictureUrl: v})} />
      </FormModal>

      <FormModal 
        title="Edit About" 
        isOpen={activeModal === 'about'} 
        onClose={() => setActiveModal(null)} 
        onSave={() => handleSaveItem('about')}
        isSubmitting={isSubmitting}
      >
        <textarea 
            className="w-full px-3 py-2 border rounded-md text-sm min-h-[150px]" 
            value={aboutForm} 
            onChange={e => setAboutForm(e.target.value)} 
            placeholder="Write a brief summary..."
        />
      </FormModal>

      <FormModal 
        title="Edit Keywords" 
        isOpen={activeModal === 'keywords'} 
        onClose={() => setActiveModal(null)} 
        onSave={() => handleSaveItem('keywords')}
        isSubmitting={isSubmitting}
      >
        <Input label="Keywords (comma separated)" placeholder="Java, Spring, React..." value={keywordsForm} onChange={v => setKeywordsForm(v)} />
        <p className="text-xs text-gray-500 mt-1">These will appear as hashtags on your profile side bar.</p>
      </FormModal>

      <FormModal 
        title="Edit Contact Info" 
        isOpen={activeModal === 'contact'} 
        onClose={() => setActiveModal(null)} 
        onSave={() => handleSaveItem('contact')}
        isSubmitting={isSubmitting}
      >
        <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={contactForm.phone} onChange={v => setContactForm({...contactForm, phone: v})} />
            <Input label="Website" value={contactForm.website} onChange={v => setContactForm({...contactForm, website: v})} />
        </div>
        <Input label="LinkedIn URL" value={contactForm.linkedin} onChange={v => setContactForm({...contactForm, linkedin: v})} />
        <Input label="GitHub URL" value={contactForm.github} onChange={v => setContactForm({...contactForm, github: v})} />
        <Input label="Twitter URL" value={contactForm.twitter} onChange={v => setContactForm({...contactForm, twitter: v})} />
        <p className="text-xs text-gray-500 mt-1">Note: Email is managed via your account settings.</p>
      </FormModal>

      {/* Contact Info Modal */}
      {showContactModal && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
                  <div className="flex justify-between items-start mb-6">
                      <h2 className="text-xl font-semibold">{profile?.firstName}'s Contact Info</h2>
                      <div className="flex gap-2">
                          <button onClick={() => { setShowContactModal(false); setActiveModal('contact'); }} className="p-1 hover:bg-gray-100 rounded-full">
                              <Pencil className="w-5 h-5 text-gray-400 hover:text-[#0a66c2]" />
                          </button>
                          <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-black">
                              <X className="w-6 h-6" />
                          </button>
                      </div>
                  </div>
                  <div className="space-y-4">
                      <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                              <p className="text-sm font-semibold">Email</p>
                              <a href={`mailto:${profile?.contactInfo?.email || user?.email}`} className="text-sm text-[#0a66c2] hover:underline">
                                  {profile?.contactInfo?.email || user?.email}
                              </a>
                          </div>
                      </div>
                      {profile?.contactInfo?.phone && (
                          <div className="flex items-center gap-3">
                             <Phone className="w-5 h-5 text-gray-400" />
                             <div>
                                 <p className="text-sm font-semibold">Phone</p>
                                 <p className="text-sm text-gray-600">{profile.contactInfo.phone}</p>
                             </div>
                          </div>
                      )}
                      {profile?.contactInfo?.website && (
                          <div className="flex items-center gap-3">
                             <Globe className="w-5 h-5 text-gray-400" />
                             <div>
                                 <p className="text-sm font-semibold">Website</p>
                                 <a href={profile.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[#0a66c2] hover:underline">
                                     {profile.contactInfo.website}
                                 </a>
                             </div>
                          </div>
                      )}
                      <div className="flex gap-4 mt-6 pt-6 border-t border-gray-100 justify-center">
                          {profile?.contactInfo?.linkedin && <a href={profile.contactInfo.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="w-5 h-5 text-gray-400 hover:text-[#0a66c2]" /></a>}
                          {profile?.contactInfo?.github && <a href={profile.contactInfo.github} target="_blank" rel="noopener noreferrer"><Github className="w-5 h-5 text-gray-400 hover:text-black" /></a>}
                          {profile?.contactInfo?.twitter && <a href={profile.contactInfo.twitter} target="_blank" rel="noopener noreferrer"><Twitter className="w-5 h-5 text-gray-400 hover:text-[#1da1f2]" /></a>}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
