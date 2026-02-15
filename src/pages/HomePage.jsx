import { Link } from "react-router-dom";
import UNIR_LOGO from "@/assets/UNIR_logo.jpeg";
import { Suspense, lazy } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import HomeScene from "@/components/HomeScene";
import { Code, Briefcase, Users, Globe, Zap, Shield, TrendingUp, Award } from "lucide-react";

// Lazy load the heavy 3D scene
// Lazy load the heavy 3D scene
// Lazy load the heavy 3D scene

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const FloatingIcon = ({ icon: Icon, delay, x, y, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1, x, y }}
    transition={{ 
      delay, 
      duration: 1,
      type: "spring",
      stiffness: 100 
    }}
    className={`absolute hidden md:flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 text-${color}-500 z-0`}
    style={{ top: y, left: x }}
  >
    <motion.div
      animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
    >
      <Icon size={24} color={color} />
    </motion.div>
  </motion.div>
);

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.22, 1, 0.36, 1] // Custom ease-out
    }
  }
};

export default function HomePage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 200]);

  return (
    <div className="min-h-screen text-[#1e3a5f] relative overflow-hidden selection:bg-[#4285F4] selection:text-white font-sans perspective-1000">
      
      {/* Header remain unchanged */}
      <header className="py-6 px-6 flex items-center justify-between max-w-[1400px] mx-auto z-50 relative">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
             <div className="absolute inset-0 bg-blue-500/40 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <img src={UNIR_LOGO} alt="UNIR" className="w-12 h-12 object-contain relative z-10 rounded-2xl shadow-lg shadow-blue-500/20" />
          </motion.div>
          <span className="text-[#1e3a5f] text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#1e3a5f] to-[#4285F4] backdrop-blur-sm">UNIR</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 bg-white/50 backdrop-blur-md px-8 py-3 rounded-full border border-white/40 shadow-sm">
          {["Discover", "People", "Learning"].map((item) => (
             <a key={item} href="#" className="text-[#1e3a5f]/80 hover:text-[#4285F4] text-sm font-medium transition-colors duration-300 relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4285F4] transition-all duration-300 group-hover:w-full"></span>
             </a>
          ))}
          <Link
            to="/jobs"
            className="text-[#1e3a5f]/80 hover:text-[#4285F4] text-sm font-medium transition-colors duration-300 relative group"
          >
            Jobs
             <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4285F4] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <div className="h-6 w-px bg-[#1e3a5f]/10" />
          <Link
            to="/login"
            className="text-[#4285F4] font-semibold hover:text-[#3367d6] px-4 py-2 transition-all duration-300"
          >
            Sign in
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
                to="/register"
                className="bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white font-semibold px-6 py-2.5 rounded-full hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
            >
                Join now
            </Link>
          </motion.div>
        </nav>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 z-10 relative">
        {/* HERO SECTION */}
        <motion.div 
          className="flex flex-col md:flex-row items-center gap-10 md:gap-20 min-h-[90vh] pt-10"
        >
          <motion.div 
            className="flex-1 space-y-10 relative z-20"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <div className="relative">
              <motion.div 
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ duration: 1, delay: 0.5 }}
                 className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
              />
              <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] text-[#1e3a5f] drop-shadow-sm visible">
                Welcome to your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC05] animate-gradient-x relative">
                  professional
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#FBBC05] opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                     <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                  </svg>
                </span> <br />
                universe
              </motion.h1>
            </div>
            
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-[#1e3a5f]/80 max-w-lg leading-relaxed font-light backdrop-blur-sm rounded-xl p-4 bg-white/30 border border-white/40">
               Connect, grow, and explore opportunities in a gravity-defying professional network designed for the future of work.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="space-y-4 max-w-md pt-4">
              <Link to="/register">
                  <motion.button 
                    whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(66, 133, 244, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-5 bg-white backdrop-blur-xl border border-white/60 rounded-full font-bold text-[#1e3a5f] text-lg hover:bg-white hover:border-[#4285F4] flex items-center justify-center gap-4 transition-all duration-300 group shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#4285F4]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    Join with email <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                  </motion.button>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Right side - Image Collage & 3D Scene Hybrid */}
          {/* Right side - Image Collage & 3D Scene Hybrid */}
          <div className="flex-1 h-[600px] w-full relative z-10 block">
             {/* 3D Scene Layer */}
             <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                   <ambientLight intensity={0.5} />
                   <HomeScene />
                   <Environment preset="city" />
                </Canvas>
             </div>

             {/* Floating Images Collage - No Entrance Animations */}
             <div className="absolute inset-0 z-10">
                {/* Top Right - Diverse Team */}
                <motion.div
                   animate={{ y: [0, -15, 0] }}
                   transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute top-0 right-0 w-64 h-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform rotate-6 bg-white block"
                >
                   <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" alt="Team" className="w-full h-full object-cover" />
                </motion.div>

                {/* Bottom Left - Coding/Tech */}
                <motion.div
                   animate={{ y: [0, 20, 0] }}
                   transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                   className="absolute bottom-20 left-4 w-56 h-56 rounded-full overflow-hidden shadow-2xl border-4 border-white transform -rotate-3 bg-white block"
                >
                   <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80" alt="Tech" className="w-full h-full object-cover" />
                </motion.div>

                {/* Center Floating - Meeting/Connection */}
                <motion.div
                   animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                   className="absolute top-1/3 left-1/3 w-48 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform rotate-12 z-20 bg-white block"
                >
                   <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80" alt="Meeting" className="w-full h-full object-cover" />
                </motion.div>
                
                {/* Small Pill - Badge */}
                <motion.div
                   animate={{ x: [0, 10, 0] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute top-1/4 left-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-white/50 z-30 flex"
                >
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-xs font-bold text-[#1e3a5f]">Hiring Now</span>
                </motion.div>
             </div>
          </div>
        </motion.div>

        {/* --- SECTION: Build Your Network --- */}
        <motion.section 
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, margin: "-20%" }}
           variants={sectionVariants}
           className="py-32 flex flex-col md:flex-row items-center gap-16"
        >
             <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-blue-500/10 rounded-[3rem] transform rotate-3 transition-transform group-hover:rotate-6 duration-500" />
                <img 
                    src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80" 
                    alt="Networking" 
                    className="w-full rounded-[3rem] shadow-2xl relative z-10 transform transition-transform group-hover:-translate-y-2 duration-500" 
                />
             </div>
             <div className="flex-1 space-y-8">
                 <h2 className="text-4xl md:text-5xl font-bold text-[#1e3a5f] leading-tight">
                    Build a network that <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] to-[#34A853]">empowers you</span>
                 </h2>
                 <p className="text-xl text-[#1e3a5f]/70 leading-relaxed">
                    Connect with industry leaders, find mentors, and unlock opportunities that you won't find on job boards. Our intelligent matching system brings the right people to your doorstep.
                 </p>
                 <button className="px-8 py-4 bg-[#1e3a5f] text-white rounded-full font-semibold hover:bg-[#162c46] hover:shadow-xl hover:scale-105 transition-all duration-300">
                    Start Connecting
                 </button>
             </div>
        </motion.section>

        {/* --- SECTION: Master Your Craft --- */}
        <motion.section 
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, margin: "-20%" }}
           variants={sectionVariants}
           className="py-32 flex flex-col-reverse md:flex-row items-center gap-16"
        >
             <div className="flex-1 space-y-8">
                 <h2 className="text-4xl md:text-5xl font-bold text-[#1e3a5f] leading-tight">
                    Master your craft with <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA4335] to-[#FBBC05]">world-class learning</span>
                 </h2>
                 <p className="text-xl text-[#1e3a5f]/70 leading-relaxed">
                    Access thousands of courses from top universities and companies. Earn certifications that matter and showcase them directly on your profile.
                 </p>
                 <div className="flex gap-4 flex-wrap">
                     {["Leadership", "Coding", "Design", "Marketing", "Data Science"].map(tag => (
                         <span key={tag} className="px-5 py-2.5 bg-white border border-[#1e3a5f]/10 rounded-xl text-sm font-medium text-[#1e3a5f]/80 shadow-sm hover:shadow-md transition-shadow cursor-default">
                             {tag}
                         </span>
                     ))}
                 </div>
             </div>
             <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-yellow-500/10 rounded-[3rem] transform -rotate-3 transition-transform group-hover:-rotate-6 duration-500" />
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <img src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&q=80" alt="Design" className="rounded-3xl shadow-lg mt-12 w-full object-cover aspect-[3/4]" />
                    <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80" alt="Students" className="rounded-3xl shadow-lg w-full object-cover aspect-[3/4]" />
                </div>
             </div>
        </motion.section>

        {/* --- Features Grid --- */}
        <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20%" }}
            variants={sectionVariants}
            className="py-32 relative z-20"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white/80 -z-10 rounded-3xl blur-3xl" />
          
          <h2 className="text-4xl md:text-6xl font-light text-center mb-20 text-[#1e3a5f] tracking-tight">
            Explore topics <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EA4335] to-[#FBBC05]">that ignite you</span>
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4 relative max-w-5xl mx-auto">
             {/* Abstract blobs */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-300/20 to-purple-300/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

            {[
              { name: "Technology", icon: Code, color: "blue" },
              { name: "Business", icon: TrendingUp, color: "green" },
              { name: "Design", icon: Zap, color: "yellow" },
              { name: "Marketing", icon: Award, color: "red" },
              { name: "Finance", icon: Briefcase, color: "blue" },
              { name: "Healthcare", icon: Shield, color: "green" },
              { name: "Education", icon: Globe, color: "yellow" },
              { name: "Engineering", icon: Code, color: "red" }
            ].map((topic, i) => (
              <motion.button
                key={topic.name}
                initial={{ opacity: 0, scale: 0, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                   delay: i * 0.05, 
                   type: "spring",
                   stiffness: 200,
                   damping: 15
                }}
                whileHover={{ 
                   scale: 1.1, 
                   backgroundColor: "rgba(255, 255, 255, 0.9)",
                   boxShadow: "0 10px 30px -5px rgba(0,0,0,0.1)"
                }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl flex items-center gap-3 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-${topic.color}-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300`} />
                <topic.icon className={`w-5 h-5 text-${topic.color}-600 group-hover:scale-110 transition-transform duration-300`} />
                <span className="text-[#1e3a5f] font-semibold text-lg relative z-10">{topic.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Job Section - Glass Cards */}
        <motion.section 
           className="py-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
           <div className="col-span-full text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-light text-[#1e3a5f] tracking-tight">
                Find your <span className="text-[#34A853] font-bold italic">perfect fit</span>
              </h2>
           </div>

           {[
              { title: "Engineering", count: "20k+ jobs", color: "blue" },
              { title: "Product", count: "8k+ jobs", color: "red" },
              { title: "Sales", count: "15k+ jobs", color: "yellow" },
              { title: "Design", count: "5k+ jobs", color: "green" }
           ].map((cat, i) => (
              <motion.div
                 key={cat.title}
                 initial={{ opacity: 0, y: 50 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 whileHover={{ y: -10, rotateX: 5, rotateY: 5 }}
                 className={`p-8 rounded-3xl bg-gradient-to-br from-white/60 to-white/20 backdrop-blur-xl border border-white/40 shadow-xl hover:shadow-${cat.color}-500/20 group cursor-pointer`}
              >
                  <div className={`w-12 h-12 rounded-2xl bg-${cat.color}-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Briefcase className={`w-6 h-6 text-${cat.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">{cat.title}</h3>
                  <p className="text-[#1e3a5f]/60 font-medium">{cat.count}</p>
                  <div className="mt-6 flex items-center gap-2 text-[#4285F4] font-semibold opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 transition-transform">
                      Explore <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">→</div>
                  </div>
              </motion.div>
           ))}
        </motion.section>

        {/* Call to Action */}
        <motion.section 
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           variants={sectionVariants}
           className="my-32 relative rounded-[3rem] overflow-hidden group"
        >
            <div className="absolute inset-0 bg-[#1e3a5f] z-0" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#4285F4]/30 to-[#EA4335]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-10" />
            
            {/* Animated particles in bg */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ 
                            y: [0, -1000], 
                            opacity: [0, 0.5, 0] 
                        }}
                        transition={{ 
                            duration: Math.random() * 10 + 10, 
                            repeat: Infinity, 
                            delay: Math.random() * 20 
                        }}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{ left: `${Math.random() * 100}%`, top: '100%' }}
                    />
                ))}
            </div>

            <div className="relative z-20 px-10 py-24 md:px-24 flex flex-col md:flex-row items-center justify-between gap-12">
               <div className="max-w-xl">
                  <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                    Ready to launch your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FBBC05] to-[#EA4335]">career?</span>
                  </h2>
                  <p className="text-white/70 text-lg mb-8">
                     Join millions of professionals in the most immersive professional network ever created.
                  </p>
                  <div className="flex gap-4">
                     <Link to="/register">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-white text-[#1e3a5f] rounded-full font-bold text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-shadow"
                        >
                            Get Started Now
                        </motion.button>
                     </Link>
                  </div>
               </div>
               
               <div className="relative">
                   <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-[300px] h-[300px] border-2 border-white/10 rounded-full flex items-center justify-center relative"
                   >
                       <div className="absolute w-full h-full rounded-full border border-dashed border-white/20 animate-spin-slow" />
                       <div className="text-9xl">🚀</div>
                   </motion.div>
               </div>
            </div>
        </motion.section>
      </main>

      <footer className="bg-white/80 backdrop-blur-xl border-t border-[#1e3a5f]/5 py-16 mt-20 z-10 relative">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
           <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <img src={UNIR_LOGO} alt="UNIR" className="w-10 h-10 object-contain rounded-xl shadow-md" />
                <span className="text-[#1e3a5f] text-2xl font-bold">UNIR</span>
              </div>
              <p className="text-[#1e3a5f]/60 text-sm">
                 The world's first gravity-defying professional network. Built for the future.
              </p>
           </div>
           
           <div>
              <h4 className="font-bold text-[#1e3a5f] mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-[#1e3a5f]/60">
                 <li><a href="#" className="hover:text-[#4285F4] transition-colors">Browse Jobs</a></li>
                 <li><a href="#" className="hover:text-[#4285F4] transition-colors">Browse People</a></li>
                 <li><a href="#" className="hover:text-[#4285F4] transition-colors">Learning</a></li>
              </ul>
           </div>

           <div>
              <h4 className="font-bold text-[#1e3a5f] mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#1e3a5f]/60">
                 <li><a href="#" className="hover:text-[#4285F4] transition-colors">About</a></li>
                 <li><a href="#" className="hover:text-[#4285F4] transition-colors">Careers</a></li>
                 <li><a href="#" className="hover:text-[#4285F4] transition-colors">Press</a></li>
              </ul>
           </div>
           
           <div>
              <h4 className="font-bold text-[#1e3a5f] mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[#1e3a5f]/60">
                 <li><a href="#" className="hover:text-[#4285F4] transition-colors">Privacy</a></li>
                 <li><a href="#" className="hover:text-[#4285F4] transition-colors">Terms</a></li>
              </ul>
           </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 mt-12 pt-8 border-t border-[#1e3a5f]/5 text-center text-sm text-[#1e3a5f]/40">
           UNIR Corporation © 2024. All rights reserved.
        </div>
      </footer>
    </div>
  );
}



