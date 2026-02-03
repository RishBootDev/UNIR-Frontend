import { Navbar } from "@/components/Navbar/Navbar";
import { useAuth } from "@/context/useAuth";
import { Camera, Pencil } from "lucide-react";
import { SubscriptionCard } from "@/components/Subscription/SubscriptionCard";

export default function ProfilePage() {
  const { user } = useAuth();

  const experiences = [
    {
      title: "Senior Software Engineer",
      company: "TechCorp",
      logo: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=48&h=48&fit=crop",
      duration: "Jan 2022 - Present",
      location: "San Francisco, CA",
      description: "Leading frontend development team, architecting scalable solutions.",
    },
    {
      title: "Software Engineer",
      company: "StartupXYZ",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=48&h=48&fit=crop",
      duration: "Jun 2019 - Dec 2021",
      location: "New York, NY",
      description: "Built core product features using React and Node.js.",
    },
  ];

  const skills = ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker", "GraphQL"];

  return (
    <div className="min-h-screen bg-[#f4f2ee]">
      <Navbar />
      <div className="pt-[52px]">
        <div className="max-w-[1128px] mx-auto px-4 py-6">
          <div className="flex gap-6">
            <div className="flex-1 max-w-[790px]">
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
                      src={user?.avatar}
                      alt="Profile"
                      className="w-[152px] h-[152px] rounded-full border-4 border-white"
                    />
                    <button className="p-2 rounded-full hover:bg-[rgba(0,0,0,0.04)]">
                      <Pencil className="w-5 h-5 text-[rgba(0,0,0,0.6)]" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <h1 className="text-2xl font-semibold text-[rgba(0,0,0,0.9)]">{user?.name}</h1>
                    <p className="text-[rgba(0,0,0,0.9)] mt-1">{user?.headline}</p>
                    <p className="text-sm text-[rgba(0,0,0,0.6)] mt-1">{user?.location}</p>
                    <p className="text-sm text-[#0a66c2] font-semibold mt-1">{user?.connections}+ connections</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="px-4 py-1.5 bg-[#0a66c2] text-white font-semibold rounded-full hover:bg-[#004182]">
                      Open to
                    </button>
                    <button className="px-4 py-1.5 border border-[#0a66c2] text-[#0a66c2] font-semibold rounded-full hover:bg-[#e7f3ff]">
                      Add profile section
                    </button>
                  </div>
                </div>
              </div>

              <div className="unir-card mt-2 p-6">
                <h2 className="text-xl font-semibold text-[rgba(0,0,0,0.9)]">About</h2>
                <p className="mt-3 text-sm text-[rgba(0,0,0,0.9)]">
                  Passionate software engineer with 5+ years of experience building scalable web applications.
                </p>
              </div>

              <SubscriptionCard />

              <div className="unir-card mt-2 p-6">
                <h2 className="text-xl font-semibold text-[rgba(0,0,0,0.9)] mb-4">Experience</h2>
                <div className="space-y-4">
                  {experiences.map((exp, index) => (
                    <div key={index} className="flex gap-3">
                      <img src={exp.logo} alt={exp.company} className="w-12 h-12 rounded" />
                      <div>
                        <h3 className="font-semibold text-[rgba(0,0,0,0.9)]">{exp.title}</h3>
                        <p className="text-sm text-[rgba(0,0,0,0.9)]">{exp.company}</p>
                        <p className="text-sm text-[rgba(0,0,0,0.6)]">{exp.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="unir-card mt-2 p-6">
                <h2 className="text-xl font-semibold text-[rgba(0,0,0,0.9)] mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-[#e7f3ff] text-[#0a66c2] rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

