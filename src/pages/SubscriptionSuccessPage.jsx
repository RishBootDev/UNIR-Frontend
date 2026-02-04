import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar/Navbar";
import { CheckCircle } from "lucide-react";

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar />
      <div className="pt-[100px] flex items-center justify-center px-4">
         <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg w-full">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle className="w-10 h-10 text-green-600" />
             </div>
             <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Premium!</h1>
             <p className="text-gray-600 mb-8">
                 Your subscription has been activated successfully. You now have access to all premium features.
             </p>
             <button 
                onClick={() => navigate('/feed')} 
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
             >
                 Go to Feed
             </button>
         </div>
      </div>
    </div>
  );
}
