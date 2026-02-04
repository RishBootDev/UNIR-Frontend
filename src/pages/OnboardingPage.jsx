import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { profileService, companyService, institutionService } from "@/services/api";
import { useAuth } from "@/context/useAuth";

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
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
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

const SectionHeader = ({ title, onAdd }) => (
  <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-100 first:border-0 first:pt-0">
    <h3 className="text-lg font-medium text-gray-800">{title}</h3>
    {onAdd && (
      <button type="button" onClick={onAdd} className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
        + Add {title}
      </button>
    )}
  </div>
);

const Input = ({ label, value, onChange, placeholder, type = "text", className = "" }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

// --- MAIN COMPONENT ---

const STEPS = [
  { id: 1, title: "Basic Info", sub: "Tell us who you are" },
  { id: 2, title: "Summary", sub: "A brief bio about yourself" },
  { id: 3, title: "Experience", sub: "Where have you worked?" },
  { id: 4, title: "Education", sub: "What is your background?" },
  { id: 5, title: "Skills", sub: "What are you good at?" },
  { id: 6, title: "Projects & Certs", sub: "Showcase your work" },
  { id: 7, title: "Finish", sub: "Ready to go!" }
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileCreated, setIsProfileCreated] = useState(false);

  // --- FORM STATE ---
  const [basicInfo, setBasicInfo] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    headline: "",
    location: "",
    industry: "",
    profilePictureUrl: "",
    summary: "",
    contactInfo: {
      phone: "",
      website: "",
      linkedin: "",
      github: "",
      twitter: ""
    }
  });

  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [certifications, setCertifications] = useState([]);

  // --- ACTIONS ---

  const handleCreateProfile = async (silent = false) => {
    if (isProfileCreated) return true;
    try {
      const payload = {
        firstName: basicInfo.firstName || user?.name?.split(" ")[0] || "User",
        lastName: basicInfo.lastName || user?.name?.split(" ")[1] || "",
        email: user?.email || "",
        headline: basicInfo.headline || "",
        location: basicInfo.location || "",
        industry: basicInfo.industry || "",
        profileUrl: `${basicInfo.firstName || "user"}-${Date.now()}`.toLowerCase(),
        profilePictureUrl: basicInfo.profilePictureUrl || "",
        summary: basicInfo.summary || "",
        contactInfo: {
            email: user?.email || "",
            phone: basicInfo.contactInfo.phone || "N/A",
            website: basicInfo.contactInfo.website || "",
            linkedin: basicInfo.contactInfo.linkedin || "",
            github: basicInfo.contactInfo.github || "",
            twitter: basicInfo.contactInfo.twitter || ""
        },
        projects: [],
        skills: [],
        languages: [],
        certifications: [],
        topKeywords: []
      };
      await profileService.createProfile(payload);
      setIsProfileCreated(true);
      return true;
    } catch (err) {
      console.error("Profile creation failed:", err);
      if (!silent) alert("Failed to initialize profile. Please check basic info.");
      return false;
    }
  };

  const handleSaveStep = async () => {
    setIsSubmitting(true);
    let success = true;

    try {
        // Ensure profile exists before adding sub-entities
        if (step > 1 && !isProfileCreated) {
            const created = await handleCreateProfile(true);
            if (!created) throw new Error("Could not create profile");
        }

        switch (step) {
            case 1:
                success = await handleCreateProfile();
                break;
            case 2:
                // Summary is saved inside profile, we already created profile in step 1 or will when they hit next
                // If they reached here, handleCreateProfile was already called or we call it now
                if (!isProfileCreated) await handleCreateProfile();
                break;
            case 3:
                for (const exp of experiences.filter(e => e.company && e.title)) {
                    await profileService.addExperience({
                        ...exp,
                        technologies: exp.technologies ? exp.technologies.split(",").map(s => s.trim()).filter(Boolean) : []
                    });
                }
                break;
            case 4:
                for (const edu of educations.filter(e => e.institution && e.degree)) {
                    await profileService.addEducation({
                        ...edu,
                        startYear: edu.startYear ? parseInt(edu.startYear) : null,
                        endYear: edu.endYear ? parseInt(edu.endYear) : null
                    });
                }
                break;
            case 5:
                for (const skill of skills.filter(s => s.name)) {
                    await profileService.addSkill(skill);
                }
                for (const lang of languages.filter(l => l.name)) {
                    await profileService.addLanguage(lang);
                }
                break;
            case 6:
                for (const proj of projects.filter(p => p.name)) {
                   await profileService.addProject({
                       ...proj,
                       technologies: proj.technologies ? proj.technologies.split(",").map(s => s.trim()).filter(Boolean) : []
                   });
                }
                for (const cert of certifications.filter(c => c.name)) {
                    await profileService.addCertification(cert);
                }
                break;
            default:
                break;
        }
    } catch (err) {
        console.error(`Save failed at step ${step}:`, err);
        alert("There was an error saving this section. You can try again or skip.");
        success = false;
    } finally {
        setIsSubmitting(false);
    }
    return success;
  };

  const nextStep = async () => {
      const saved = await handleSaveStep();
      if (saved) setStep(s => s + 1);
  };

  const skipStep = () => {
      setStep(s => s + 1);
  };

  const finalize = async () => {
      setIsSubmitting(true);
      try {
          if (!isProfileCreated) {
              await handleCreateProfile(true); 
          }
          await logout();
          navigate("/login");
      } catch (err) {
          console.error("Finalize failed:", err);
          navigate("/login");
      }
  };

  // --- RENDERERS ---

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name" value={basicInfo.firstName} onChange={v => setBasicInfo({...basicInfo, firstName: v})} />
        <Input label="Last Name" value={basicInfo.lastName} onChange={v => setBasicInfo({...basicInfo, lastName: v})} />
      </div>
      <Input label="Headline" placeholder="e.g. Senior Java Developer" value={basicInfo.headline} onChange={v => setBasicInfo({...basicInfo, headline: v})} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Location" placeholder="City, Country" value={basicInfo.location} onChange={v => setBasicInfo({...basicInfo, location: v})} />
        <Input label="Industry" placeholder="e.g. FinTech, Healthcare" value={basicInfo.industry} onChange={v => setBasicInfo({...basicInfo, industry: v})} />
      </div>
      <Input label="Profile Picture URL" placeholder="https://..." value={basicInfo.profilePictureUrl} onChange={v => setBasicInfo({...basicInfo, profilePictureUrl: v})} />
      <SectionHeader title="Contact Info" />
      <div className="grid grid-cols-2 gap-4">
         <Input label="Phone" value={basicInfo.contactInfo.phone} onChange={v => setBasicInfo({...basicInfo, contactInfo: {...basicInfo.contactInfo, phone: v}})} />
         <Input label="Website" value={basicInfo.contactInfo.website} onChange={v => setBasicInfo({...basicInfo, contactInfo: {...basicInfo.contactInfo, website: v}})} />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 mb-2">Write a short summary about your professional path and goals.</p>
      <textarea
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
        placeholder="I am a passionate developer with..."
        value={basicInfo.summary}
        onChange={e => setBasicInfo({...basicInfo, summary: e.target.value})}
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
        <SectionHeader title="Experience" onAdd={() => setExperiences([...experiences, { title: "", company: null, startDate: "", endDate: "", description: "", employmentType: "FULL_TIME", technologies: "" }])} />
        {experiences.length === 0 && <p className="text-center text-gray-400 py-10 border-2 border-dashed rounded-lg">No experience added yet. Click "+ Add Experience" or skip.</p>}
        {experiences.map((exp, idx) => (
          <div key={idx} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
             <AsyncSelect label="Company" service={companyService} value={exp.company?.name} onSelect={c => { const n = [...experiences]; n[idx].company = c; setExperiences(n); }} />
             <div className="grid grid-cols-2 gap-4 mt-3">
                <Input label="Title" value={exp.title} onChange={v => { const n = [...experiences]; n[idx].title = v; setExperiences(n); }} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={exp.employmentType}
                    onChange={e => { const n = [...experiences]; n[idx].employmentType = e.target.value; setExperiences(n); }}
                  >
                    <option value="FULL_TIME">Full Time</option><option value="PART_TIME">Part Time</option><option value="CONTRACT">Contract</option><option value="INTERNSHIP">Internship</option><option value="FREELANCE">Freelance</option><option value="TEMPORARY">Temporary</option>
                  </select>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4 mt-3">
               <Input type="date" label="Start Date" value={exp.startDate} onChange={v => { const n = [...experiences]; n[idx].startDate = v; setExperiences(n); }} />
               <Input type="date" label="End Date" value={exp.endDate} onChange={v => { const n = [...experiences]; n[idx].endDate = v; setExperiences(n); }} />
             </div>
             <Input className="mt-3" label="Technologies (comma separated)" placeholder="Java, React..." value={exp.technologies} onChange={v => { const n = [...experiences]; n[idx].technologies = v; setExperiences(n); }} />
             <Input className="mt-3" label="Description" value={exp.description} onChange={v => { const n = [...experiences]; n[idx].description = v; setExperiences(n); }} />
          </div>
        ))}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
        <SectionHeader title="Education" onAdd={() => setEducations([...educations, { institution: null, degree: "", fieldOfStudy: "", startYear: "", endYear: "", grade: "" }])} />
        {educations.length === 0 && <p className="text-center text-gray-400 py-10 border-2 border-dashed rounded-lg">No education added yet.</p>}
        {educations.map((edu, idx) => (
           <div key={idx} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
              <AsyncSelect label="School/University" service={institutionService} value={edu.institution?.name} onSelect={i => { const n = [...educations]; n[idx].institution = i; setEducations(n); }} />
              <div className="grid grid-cols-2 gap-4 mt-3">
                <Input label="Degree" value={edu.degree} onChange={v => { const n = [...educations]; n[idx].degree = v; setEducations(n); }} />
                <Input label="Field of Study" value={edu.fieldOfStudy} onChange={v => { const n = [...educations]; n[idx].fieldOfStudy = v; setEducations(n); }} />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <Input label="Start Year" placeholder="2018" value={edu.startYear} onChange={v => { const n = [...educations]; n[idx].startYear = v; setEducations(n); }} />
                <Input label="End Year" placeholder="2022" value={edu.endYear} onChange={v => { const n = [...educations]; n[idx].endYear = v; setEducations(n); }} />
              </div>
           </div>
        ))}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-8">
        <SectionHeader title="Skills" onAdd={() => setSkills([...skills, { name: "", proficiency: "INTERMEDIATE" }])} />
        {skills.map((skill, idx) => (
            <div key={idx} className="flex gap-4 mb-2">
               <Input className="flex-1" label="Skill Name" value={skill.name} onChange={v => { const n = [...skills]; n[idx].name = v; setSkills(n); }} />
               <select className="w-1/3 mt-6 border rounded-md px-2" value={skill.proficiency} onChange={e => { const n = [...skills]; n[idx].proficiency = e.target.value; setSkills(n); }}>
                  <option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="ADVANCED">Advanced</option><option value="EXPERT">Expert</option>
               </select>
            </div>
        ))}
        <SectionHeader title="Languages" onAdd={() => setLanguages([...languages, { name: "", proficiency: "" }])} />
        {languages.map((lang, idx) => (
             <div key={idx} className="grid grid-cols-2 gap-4 mb-2">
                 <Input label="Language" value={lang.name} onChange={v => { const n = [...languages]; n[idx].name = v; setLanguages(n); }} />
                 <Input label="Proficiency" value={lang.proficiency} onChange={v => { const n = [...languages]; n[idx].proficiency = v; setLanguages(n); }} />
             </div>
        ))}
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-8">
        <SectionHeader title="Projects" onAdd={() => setProjects([...projects, { name: "", role: "", description: "", technologies: "" }])} />
        {projects.map((proj, idx) => (
             <div key={idx} className="bg-gray-50 p-4 mb-4 rounded-lg border">
                <Input label="Project Name" value={proj.name} onChange={v => { const n = [...projects]; n[idx].name = v; setProjects(n); }} />
                <Input className="mt-2" label="Role" value={proj.role} onChange={v => { const n = [...projects]; n[idx].role = v; setProjects(n); }} />
             </div>
        ))}
        <SectionHeader title="Certifications" onAdd={() => setCertifications([...certifications, { name: "", date: "" }])} />
        {certifications.map((cert, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md">
                <Input label="Name" value={cert.name} onChange={v => { const n = [...certifications]; n[idx].name = v; setCertifications(n); }} />
                <Input type="date" label="Date" value={cert.date} onChange={v => { const n = [...certifications]; n[idx].date = v; setCertifications(n); }} />
            </div>
        ))}
    </div>
  );

  const renderStep7 = () => (
    <div className="text-center py-20 space-y-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl">✓</div>
        <h2 className="text-3xl font-bold">You're all set!</h2>
        <p className="text-gray-600 max-w-sm mx-auto">Click "Complete" to finish your setup and start networking.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center py-10 px-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[750px]">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-100 flex">
           {STEPS.map(s => (
             <div key={s.id} className={`flex-1 transition-all duration-500 ${step >= s.id ? 'bg-blue-600' : 'bg-transparent'}`} />
           ))}
        </div>

        {/* Header */}
        <div className="px-10 py-8 border-b border-gray-50">
           <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Step {step} of {STEPS.length}</span>
           <h1 className="text-2xl font-bold text-gray-900 mt-1">{STEPS[step-1].title}</h1>
           <p className="text-gray-500 text-sm">{STEPS[step-1].sub}</p>
        </div>

        {/* Content */}
        <div className="flex-1 p-10 overflow-y-auto">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
            {step === 6 && renderStep6()}
            {step === 7 && renderStep7()}
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            {step > 1 && step < 7 ? (
                <button onClick={() => setStep(s => s - 1)} className="text-gray-500 font-medium hover:text-gray-800 transition">Back</button>
            ) : <div />}

            <div className="flex gap-4">
                {step < 7 && (
                    <button 
                        onClick={skipStep} 
                        className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-200 rounded-full transition"
                    >
                        Skip Section
                    </button>
                )}
                
                <button 
                    onClick={step === 7 ? finalize : nextStep}
                    disabled={isSubmitting}
                    className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
                >
                    {isSubmitting ? "Processing..." : step === 7 ? "Complete Setup" : "Next Section"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
