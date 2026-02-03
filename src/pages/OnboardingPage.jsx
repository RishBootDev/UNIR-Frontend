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
                onSelect(item); // Pass full object (has name, logoUrl etc)
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

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FORM STATE ---
  const [basicInfo, setBasicInfo] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    headline: "",
    location: "",
    industry: "",
    profilePictureUrl: "", // New
    summary: "",
    contactInfo: {
      email: user?.email || "", // Required by backend
      phone: "",
      website: "",
      linkedin: "", // New
      github: "", // New
      twitter: "" // New
    }
  });

  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [certifications, setCertifications] = useState([]);

  // --- ACTIONS ---

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Construct Payload exactly matching PersonDTO
      const payload = {
        ...basicInfo,
        contactInfo: {
            ...basicInfo.contactInfo,
            email: basicInfo.email, // Ensure this stays synced
            phone: basicInfo.contactInfo.phone || "N/A" // Fallback for NotNull constraint
        },
        experiences: experiences
            .filter(exp => exp.company && exp.title) // Only send if company and title exist
            .map(exp => ({
                ...exp,
                technologies: exp.technologies ? exp.technologies.split(",").map(s => s.trim()).filter(Boolean) : []
            })),
        educations: educations
            .filter(edu => edu.institution && edu.degree) // Only send if institution and degree exist
            .map(edu => ({
                ...edu,
                startYear: edu.startYear ? parseInt(edu.startYear) : null, // Convert to number if it's Year
                endYear: edu.endYear ? parseInt(edu.endYear) : null
            })),
        projects: projects
            .filter(proj => proj.name) // Only send if project has a name
            .map(proj => ({
                ...proj,
                technologies: proj.technologies ? proj.technologies.split(",").map(s => s.trim()).filter(Boolean) : []
            })),
        skills: skills.filter(s => s.name),
        languages: languages.filter(l => l.name),
        certifications: certifications.filter(c => c.name),
        topKeywords: [] // Optional
      };

      await profileService.createProfile(payload);
      
      // Logout and redirect to login
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Profile creation failed:", err);
      alert("Failed to create profile. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  const skip = () => {
      // Just confirm and then submit what we have, or empty? 
      // User likely wants to skip *rest*, so let's submit current state.
      handleSubmit(); 
  };


  // --- STEPS RENDERERS ---

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Summary / About</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          value={basicInfo.summary}
          onChange={e => setBasicInfo({...basicInfo, summary: e.target.value})}
        />
      </div>

      <SectionHeader title="Contact Info" />
      <div className="grid grid-cols-2 gap-4">
         <Input label="Phone" value={basicInfo.contactInfo.phone} onChange={v => setBasicInfo({...basicInfo, contactInfo: {...basicInfo.contactInfo, phone: v}})} />
         <Input label="Website" value={basicInfo.contactInfo.website} onChange={v => setBasicInfo({...basicInfo, contactInfo: {...basicInfo.contactInfo, website: v}})} />
         <Input label="LinkedIn URL" value={basicInfo.contactInfo.linkedin} onChange={v => setBasicInfo({...basicInfo, contactInfo: {...basicInfo.contactInfo, linkedin: v}})} />
         <Input label="GitHub URL" value={basicInfo.contactInfo.github} onChange={v => setBasicInfo({...basicInfo, contactInfo: {...basicInfo.contactInfo, github: v}})} />
         <Input label="Twitter URL" value={basicInfo.contactInfo.twitter} onChange={v => setBasicInfo({...basicInfo, contactInfo: {...basicInfo.contactInfo, twitter: v}})} />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      {/* EXPERIENCE */}
      <section>
        <SectionHeader title="Experience" onAdd={() => setExperiences([...experiences, { title: "", company: null, startDate: "", endDate: "", description: "", employmentType: "FULL_TIME", technologies: "" }])} />
        {experiences.map((exp, idx) => (
          <div key={idx} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
             <AsyncSelect label="Company" service={companyService} value={exp.company?.name} onSelect={c => { const n = [...experiences]; n[idx].company = c; setExperiences(n); }} />
             <div className="grid grid-cols-2 gap-4 mt-3">
               <Input label="Title" value={exp.title} onChange={v => { const n = [...experiences]; n[idx].title = v; setExperiences(n); }} />
               <Input label="Employment Type" value={exp.employmentType} onChange={v => { const n = [...experiences]; n[idx].employmentType = v; setExperiences(n); }} />
             </div>
             <div className="grid grid-cols-2 gap-4 mt-3">
               <Input type="date" label="Start Date" value={exp.startDate} onChange={v => { const n = [...experiences]; n[idx].startDate = v; setExperiences(n); }} />
               <Input type="date" label="End Date" value={exp.endDate} onChange={v => { const n = [...experiences]; n[idx].endDate = v; setExperiences(n); }} />
             </div>
             <div className="mt-3">
                 <Input label="Technologies (comma separated)" placeholder="Java, React, AWS" value={exp.technologies} onChange={v => { const n = [...experiences]; n[idx].technologies = v; setExperiences(n); }} />
             </div>
             <div className="mt-3">
                <Input label="Description" value={exp.description} onChange={v => { const n = [...experiences]; n[idx].description = v; setExperiences(n); }} />
             </div>
          </div>
        ))}
      </section>

      {/* EDUCATION */}
      <section>
        <SectionHeader title="Education" onAdd={() => setEducations([...educations, { institution: null, degree: "", fieldOfStudy: "", startYear: "", endYear: "", grade: "" }])} />
        {educations.map((edu, idx) => (
           <div key={idx} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
              <AsyncSelect label="School/University" service={institutionService} value={edu.institution?.name} onSelect={i => { const n = [...educations]; n[idx].institution = i; setEducations(n); }} />
              <div className="grid grid-cols-2 gap-4 mt-3">
                <Input label="Degree" value={edu.degree} onChange={v => { const n = [...educations]; n[idx].degree = v; setEducations(n); }} />
                <Input label="Field of Study" value={edu.fieldOfStudy} onChange={v => { const n = [...educations]; n[idx].fieldOfStudy = v; setEducations(n); }} />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <Input label="Start Year" placeholder="2018" value={edu.startYear} onChange={v => { const n = [...educations]; n[idx].startYear = v; setEducations(n); }} />
                <Input label="End Year" placeholder="2022" value={edu.endYear} onChange={v => { const n = [...educations]; n[idx].endYear = v; setEducations(n); }} />
                <Input label="Grade" placeholder="3.8 GPA" value={edu.grade} onChange={v => { const n = [...educations]; n[idx].grade = v; setEducations(n); }} />
              </div>
           </div>
        ))}
      </section>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      {/* PROJECTS */}
      <section>
         <SectionHeader title="Projects" onAdd={() => setProjects([...projects, { name: "", role: "", description: "", repoUrl: "", demoUrl: "", technologies: "", startDate: "", endDate: "" }])} />
         {projects.map((proj, idx) => (
             <div key={idx} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                <Input label="Project Name" value={proj.name} onChange={v => { const n = [...projects]; n[idx].name = v; setProjects(n); }} />
                <div className="grid grid-cols-2 gap-4 mt-3">
                    <Input label="Role" value={proj.role} onChange={v => { const n = [...projects]; n[idx].role = v; setProjects(n); }} />
                    <Input label="Technologies" placeholder="Comma separated" value={proj.technologies} onChange={v => { const n = [...projects]; n[idx].technologies = v; setProjects(n); }} />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                    <Input type="date" label="Start Date" value={proj.startDate} onChange={v => { const n = [...projects]; n[idx].startDate = v; setProjects(n); }} />
                    <Input type="date" label="End Date" value={proj.endDate} onChange={v => { const n = [...projects]; n[idx].endDate = v; setProjects(n); }} />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                    <Input label="Repo URL" value={proj.repoUrl} onChange={v => { const n = [...projects]; n[idx].repoUrl = v; setProjects(n); }} />
                    <Input label="Demo URL" value={proj.demoUrl} onChange={v => { const n = [...projects]; n[idx].demoUrl = v; setProjects(n); }} />
                </div>
                <div className="mt-3">
                     <Input label="Description" value={proj.description} onChange={v => { const n = [...projects]; n[idx].description = v; setProjects(n); }} />
                </div>
             </div>
         ))}
      </section>

      {/* SKILLS */}
      <section>
          <SectionHeader title="Skills" onAdd={() => setSkills([...skills, { name: "", proficiency: "INTERMEDIATE" }])} />
          {skills.map((skill, idx) => (
              <div key={idx} className="flex gap-4 mb-2">
                 <Input className="flex-1" label="Skill Name" value={skill.name} onChange={v => { const n = [...skills]; n[idx].name = v; setSkills(n); }} />
                 <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={skill.proficiency}
                      onChange={e => { const n = [...skills]; n[idx].proficiency = e.target.value; setSkills(n); }}
                    >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                        <option value="EXPERT">Expert</option>
                    </select>
                 </div>
              </div>
          ))}
      </section>

      {/* CERTIFICATIONS */}
      <section>
          <SectionHeader title="Certifications" onAdd={() => setCertifications([...certifications, { name: "", date: "", credentialUrl: "" }])} />
          {certifications.map((cert, idx) => (
              <div key={idx} className="bg-gray-50 p-4 mb-4 rounded-lg border border-gray-200 grid grid-cols-2 gap-4">
                  <Input label="Name" value={cert.name} onChange={v => { const n = [...certifications]; n[idx].name = v; setCertifications(n); }} />
                  <Input type="date" label="Date" value={cert.date} onChange={v => { const n = [...certifications]; n[idx].date = v; setCertifications(n); }} />
                  <Input className="col-span-2" label="Credential URL" value={cert.credentialUrl} onChange={v => { const n = [...certifications]; n[idx].credentialUrl = v; setCertifications(n); }} />
              </div>
          ))}
      </section>
      
      {/* LANGUAGES */}
        <section>
          <SectionHeader title="Languages" onAdd={() => setLanguages([...languages, { name: "", proficiency: "" }])} />
          {languages.map((lang, idx) => (
               <div key={idx} className="flex gap-4 mb-2">
                   <Input className="flex-1" label="Language" value={lang.name} onChange={v => { const n = [...languages]; n[idx].name = v; setLanguages(n); }} />
                   <Input className="flex-1" label="Proficiency (e.g. Native, Fluent)" value={lang.proficiency} onChange={v => { const n = [...languages]; n[idx].proficiency = v; setLanguages(n); }} />
               </div>
          ))}
      </section>

    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f2ef] py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
           <div>
             <h1 className="text-2xl font-bold text-gray-800">Setup your profile</h1>
             <p className="text-gray-500 text-sm mt-1">Step {step} of 3</p>
           </div>
           <div className="flex gap-2">
              <div className={`h-2 w-8 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`h-2 w-8 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`h-2 w-8 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center sticky bottom-0">
           {step === 1 ? (
             <button onClick={skip} className="text-gray-500 font-semibold hover:text-gray-700">Skip All</button>
           ) : (
             <button onClick={prevStep} className="text-gray-600 font-semibold hover:text-gray-800">Back</button>
           )}

           <div className="flex gap-4">
              <button 
                onClick={step === 3 ? handleSubmit : nextStep}
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : step === 3 ? "Complete Profile" : "Next Step"}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
