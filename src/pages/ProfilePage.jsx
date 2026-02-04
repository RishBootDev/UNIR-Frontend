import { Navbar } from "@/components/Navbar/Navbar";
import { useAuth } from "@/context/useAuth";
import { Camera, Pencil, Briefcase, GraduationCap, Award, ExternalLink, Globe, Mail, Phone, Link as LinkIcon, Twitter, Linkedin, Github, X, Plus } from "lucide-react";
import { SubscriptionCard } from "@/components/Subscription/SubscriptionCard";
import { useState, useEffect } from "react";
import { profileService, companyService, institutionService } from "@/services/api";

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
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    {children}
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-full transition">Cancel</button>
                    <button onClick={onSave} disabled={isSubmitting} className="px-6 py-2 bg-[#0a66c2] text-white font-bold rounded-full hover:bg-[#004182] transition disabled:opacity-50">
                        {isSubmitting ? "Saving..." : "Save"}
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
    <div className="unir-card mt-2 p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-xl font-semibold text-[rgba(0,0,0,0.9)]">{title}</h2>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setActiveModal(type)} className="p-2 rounded-full hover:bg-[rgba(0,0,0,0.04)] text-blue-600">
                <Plus className="w-6 h-6" />
            </button>
            <button className="p-2 rounded-full hover:bg-[rgba(0,0,0,0.04)]">
                <Pencil className="w-5 h-5 text-[rgba(0,0,0,0.6)]" />
            </button>
        </div>
      </div>
      {items && items.length > 0 ? (
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index}>
                {renderItem(item)}
                {index < items.length - 1 && <div className="border-b border-gray-100 mt-6" />}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[rgba(0,0,0,0.6)] py-4">No {title.toLowerCase()} added yet.</p>
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
              <div className="unir-card overflow-hidden">
                <div className="relative">
                  <div className="h-[200px] bg-gradient-to-r from-[#0077b5] to-[#00a0dc]" />
                  <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:bg-gray-50">
                    <Camera className="w-5 h-5 text-[#0a66c2]" />
                  </button>
                </div>
                <div className="px-6 pb-6 -mt-[88px]">
                  <div className="flex justify-between items-end">
                    <img
                      src={profile?.profilePictureUrl || user?.avatar || "https://static.licdn.com/aero-v1/networks/ghost-finder/ghost-person.612aaaff.png"}
                      alt="Profile"
                      className="w-[152px] h-[152px] rounded-full border-4 border-white object-cover bg-white"
                    />
                    <button className="p-2 rounded-full hover:bg-[rgba(0,0,0,0.04)]">
                      <Pencil className="w-5 h-5 text-[rgba(0,0,0,0.6)]" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <h1 className="text-2xl font-semibold text-[rgba(0,0,0,0.9)]">
                        {profile ? `${profile.firstName} ${profile.lastName}` : user?.name}
                    </h1>
                    <p className="text-[rgba(0,0,0,0.9)] mt-1">{profile?.headline || user?.headline || "No headline added"}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-sm text-[rgba(0,0,0,0.6)]">
                        {profile?.location && <span>{profile.location}</span>}
                        {profile?.location && profile?.industry && <span>•</span>}
                        {profile?.industry && <span>{profile.industry}</span>}
                        {(profile?.location || profile?.industry) && <span>•</span>}
                        <button 
                            onClick={() => setShowContactModal(true)}
                            className="text-[#0a66c2] font-semibold hover:underline"
                        >
                            Contact info
                        </button>
                    </div>
                    <p className="text-sm text-[#0a66c2] font-semibold mt-1">{profile?.connections?.length || 0} connections</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="px-4 py-1.5 bg-[#0a66c2] text-white font-semibold rounded-full hover:bg-[#004182] transition shadow-sm">
                      Open to
                    </button>
                    <button className="px-4 py-1.5 border border-[#0a66c2] text-[#0a66c2] font-semibold rounded-full hover:bg-[#e7f3ff] transition">
                      Add profile section
                    </button>
                    <button className="px-4 py-1.5 border border-gray-400 text-gray-600 font-semibold rounded-full hover:bg-gray-50 transition">
                      More
                    </button>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="unir-card mt-2 p-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-[rgba(0,0,0,0.9)]">About</h2>
                    <button className="p-2 rounded-full hover:bg-[rgba(0,0,0,0.04)]">
                        <Pencil className="w-5 h-5 text-[rgba(0,0,0,0.6)]" />
                    </button>
                </div>
                <p className="text-sm text-[rgba(0,0,0,0.9)] whitespace-pre-wrap">
                  {profile?.summary || "Add a summary to tell your professional story."}
                </p>
              </div>

              {/* Experience Section */}
              {renderSection("Experience", profile?.experiences, (exp) => (
                <div className="flex gap-3">
                  <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center">
                    {exp.company?.logoUrl ? (
                         <img src={exp.company.logoUrl} alt={exp.company.name} className="w-full h-full object-contain p-1" />
                    ) : <Briefcase className="w-6 h-6 text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[rgba(0,0,0,0.9)]">{exp.title}</h3>
                    <p className="text-sm text-[rgba(0,0,0,0.9)]">{exp.company?.name}</p>
                    <p className="text-sm text-[rgba(0,0,0,0.6)]">
                        {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                    </p>
                    <p className="text-sm text-[rgba(0,0,0,0.6)] mt-1">{exp.employmentType?.replace('_', ' ')}</p>
                    {exp.description && <p className="text-sm text-[rgba(0,0,0,0.7)] mt-2">{exp.description}</p>}
                    {exp.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                            {exp.technologies.map((tech, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{tech}</span>
                            ))}
                        </div>
                    )}
                  </div>
                </div>
              ), <Briefcase className="w-5 h-5 text-gray-700" />, 'experience')}

              {/* Education Section */}
              {renderSection("Education", profile?.educations, (edu) => (
                <div className="flex gap-3">
                  <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center text-xl">
                    {edu.institution?.logoUrl ? (
                         <img src={edu.institution.logoUrl} alt={edu.institution.name} className="w-full h-full object-contain p-1" />
                    ) : <GraduationCap className="w-6 h-6 text-gray-400" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[rgba(0,0,0,0.9)]">{edu.institution?.name}</h3>
                    <p className="text-sm text-[rgba(0,0,0,0.9)]">
                        {edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
                    </p>
                    <p className="text-sm text-[rgba(0,0,0,0.6)]">
                        {edu.startYear} - {edu.endYear || "Present"}
                    </p>
                    {edu.grade && <p className="text-sm text-[rgba(0,0,0,0.7)] mt-1">Grade: {edu.grade}</p>}
                  </div>
                </div>
              ), <GraduationCap className="w-5 h-5 text-gray-700" />, 'education')}

              {/* Skills Section */}
              <div className="unir-card mt-2 p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-gray-700" />
                        <h2 className="text-xl font-semibold text-[rgba(0,0,0,0.9)]">Skills</h2>
                    </div>
                  <div className="flex gap-2">
                    <button onClick={() => setActiveModal('skill')} className="p-2 rounded-full hover:bg-[rgba(0,0,0,0.04)] text-blue-600">
                        <Plus className="w-6 h-6" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-[rgba(0,0,0,0.04)]">
                        <Pencil className="w-5 h-5 text-[rgba(0,0,0,0.6)]" />
                    </button>
                  </div>
                </div>
                {profile?.skills?.length > 0 ? (
                    <div className="space-y-4">
                        {profile.skills.map((skill, index) => (
                            <div key={index} className="flex flex-col border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                <span className="font-semibold text-[rgba(0,0,0,0.9)] text-sm">{skill.name}</span>
                                <span className="text-xs text-[rgba(0,0,0,0.5)] mt-0.5">{skill.proficiency}</span>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-[rgba(0,0,0,0.6)]">No skills listed yet.</p>}
              </div>

               {/* Projects Section */}
               {renderSection("Projects", profile?.projects, (proj) => (
                <div className="space-y-2">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-[rgba(0,0,0,0.9)]">{proj.name}</h3>
                        <div className="flex gap-2">
                            {proj.repoUrl && <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0a66c2]"><Globe className="w-4 h-4" /></a>}
                            {proj.demoUrl && <a href={proj.demoUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0a66c2]"><ExternalLink className="w-4 h-4" /></a>}
                        </div>
                    </div>
                    <p className="text-sm text-[rgba(0,0,0,0.7)] font-medium">{proj.role}</p>
                    <p className="text-sm text-[rgba(0,0,0,0.6)]">{formatDate(proj.startDate)} - {formatDate(proj.endDate)}</p>
                    <p className="text-sm text-[rgba(0,0,0,0.7)] mt-2">{proj.description}</p>
                </div>
              ), <Briefcase className="w-5 h-5 text-gray-700" />, 'project')}

              {/* Certifications Section */}
              {renderSection("Certifications", profile?.certifications, (cert) => (
                <div className="flex gap-3">
                  <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center text-xl">
                    <Award className="w-6 h-6 text-[#c37d16]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[rgba(0,0,0,0.9)]">{cert.name}</h3>
                    <p className="text-sm text-[rgba(0,0,0,0.6)]">Issued {formatDate(cert.date)}</p>
                    {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 border border-gray-400 rounded-full hover:bg-gray-50 transition">
                            Show credential <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                  </div>
                </div>
              ), <Award className="w-5 h-5 text-gray-700" />, 'certification')}

              <SubscriptionCard />
            </div>

            {/* Right Sidebar - Dynamic placeholder */}
            <div className="hidden lg:block w-[300px]">
                <div className="unir-card p-4 mb-4">
                    <h3 className="font-semibold text-[rgba(0,0,0,0.9)] mb-3">Profile Language</h3>
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
                {profile?.topKeywords?.size > 0 && (
                    <div className="unir-card p-4 mb-4">
                        <h3 className="font-semibold text-[rgba(0,0,0,0.9)] mb-3">Keywords</h3>
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
        <Input label="Grade" placeholder="3.8 GPA" value={eduForm.grade} onChange={v => setEduForm({...eduForm, grade: v})} />
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

      {/* Contact Info Modal */}
      {showContactModal && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
                  <div className="flex justify-between items-start mb-6">
                      <h2 className="text-xl font-semibold">{profile?.firstName}'s Contact Info</h2>
                      <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-black">
                          <X className="w-6 h-6" />
                      </button>
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
