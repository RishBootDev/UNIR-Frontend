import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar/Navbar";
import { Spinner } from "@/components/ui/Spinner";
import { Check, Shield, Zap, Star } from "lucide-react";
import { useAuth } from "@/context/useAuth";
import { paymentService, subscriptionService } from "@/services/api";

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function SubscriptionPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // active, inactive, testing
    const [subLoading, setSubLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            checkSubscription();
        }
    }, [user?.id]);

    const checkSubscription = async () => {
        try {
            const data = await subscriptionService.getStatus(user.id);
            setStatus(data.active ? 'active' : 'inactive');
        } catch (err) {
            console.error("Failed to check subscription", err);
        } finally {
            setSubLoading(false);
        }
    };

    const handleSubscribe = async () => {
        const res = await loadRazorpayScript();
        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }

        setLoading(true);

        try {
            // 1. Create Order
            // Backend expects amount in Rupees and converts to paise (multiplies by 100)
            const orderData = await paymentService.createOrder(499, "INR");
            // The backend returns a JSON string, need to parse if not automatically parsed by api implementation
            // Assuming api.js auto parses JSON. If backend returns stringified JSON, check response.
            // Based on PaymentController: return ResponseEntity.ok(order.toString());
            // This might mean api.js returns a string. Let's handle both.
            
            const order = typeof orderData === 'string' ? JSON.parse(orderData) : orderData;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_G7Gz7G7Gz7Gz7G", // Replace with env var
                amount: order.amount,
                currency: order.currency,
                name: "Unir Premium",
                description: "Unlock premium features",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await paymentService.verifyPayment({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });

                        if (verifyRes) {
                            alert("Payment Successful! Welcome to Premium.");
                            checkSubscription();
                            navigate("/premium-success");
                        } else {
                            alert("Payment verification failed.");
                        }
                    } catch (err) {
                        console.error("Verification error", err);
                        alert("Payment verification error.");
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone || "",
                },
                theme: {
                    color: "#2563eb",
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (err) {
            console.error("Payment Error", err);
            // Show the actual error message to help debugging
            alert(`Payment Error: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    if (subLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

    return (
        <div className="min-h-screen bg-[#f3f2ef]">
            <Navbar />
            <div className="pt-[100px] max-w-4xl mx-auto px-4 pb-10">
                
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade to Unir Premium</h1>
                    <p className="text-xl text-gray-600">Accelerate your career with exclusive tools.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-yellow-500/20 max-w-md mx-auto relative">
                    {status === 'active' && (
                        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10">
                            CURRENT PLAN
                        </div>
                    )}
                    
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white text-center">
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                        </div>
                        <h2 className="text-2xl font-bold">Premium Career</h2>
                        <div className="mt-4 flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-bold">₹499</span>
                            <span className="text-slate-400">/month</span>
                        </div>
                    </div>

                    <div className="p-8">
                        <ul className="space-y-4 mb-8">
                            {[
                                "See who viewed your profile",
                                "Unlimited InMail messages",
                                "Access to 15,000+ LinkedIn Learning courses",
                                "Applicant insights for jobs",
                                "Browse anonymously"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-700">
                                    <div className="mt-0.5 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
                                    </div>
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {status === 'active' ? (
                            <div className="text-center p-4 bg-green-50 text-green-700 rounded-xl font-medium border border-green-100">
                                You are already a Premium member!
                            </div>
                        ) : (
                            <button 
                                onClick={handleSubscribe} 
                                disabled={loading}
                                className="w-full py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading && <Spinner className="w-5 h-5 text-white border-white" />}
                                {loading ? "Processing..." : "Subscribe Now"}
                            </button>
                        )}
                        
                        <p className="text-xs text-gray-400 text-center mt-4">
                            Secure payment via Razorpay. Cancel anytime.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
