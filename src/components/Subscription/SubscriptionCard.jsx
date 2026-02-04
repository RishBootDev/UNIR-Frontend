import { useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { SubscriptionService } from "@/services/subscriptionService";
import { Spinner } from "@/components/ui/Spinner";

export function SubscriptionCard() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // You should ideally get this from env or backend
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder";

  useEffect(() => {
    if (user?.id) {
      loadStatus();
    }
  }, [user?.id]);

  const loadStatus = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await SubscriptionService.getStatus(user.id);
      setStatus(data);
    } catch (err) {
      console.error("Failed to load subscription status", err);
      // Fallback for demo/dev if backend not reachable
      // setStatus({ active: false, status: "INACTIVE" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setProcessing(true);
      setError(null);

      // 1. Create Order in Backend (e.g. 99 INR)
      const orderData = await SubscriptionService.createOrder(99, user.id);
      
      // orderData returns a JSON string representation of Razorpay Order or the JSON object directly
      // Adjust based on actual backend response structure. 
      // Based on PaymentController: return ResponseEntity.ok(order.toString()); -> returns string
      // But fetchWithAuth parses JSON if content-type is json.
      // Let's assume parsed object. Field names: 'id' (order_id), 'amount', etc.
      
      const options = {
        key: RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "UNIR Premium",
        description: "Unlock premium features",
        order_id: orderData.id,
        handler: async function (response) {
            try {
                // 2. Verify Payment
                const verifyRes = await SubscriptionService.verifyPayment(
                    response.razorpay_order_id,
                    response.razorpay_payment_id,
                    response.razorpay_signature
                );
                
                if (verifyRes) {
                    await loadStatus();
                    alert("Upgrade Successful!");
                } else {
                    alert("Verification failed");
                }
            } catch (err) {
                console.error(err);
                alert("Payment verification failed");
            }
        },
        prefill: {
          name: user.name,
          email: user.email, 
          contact: user.phone || ""
        },
        theme: {
          color: "#0a66c2"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        alert(response.error.description);
      });
      rzp1.open();

    } catch (err) {
      console.error("Upgrade failed", err);
      setError("Failed to initiate upgrade");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
      try {
          if(!confirm("Are you sure you want to cancel?")) return;
          setProcessing(true);
          await SubscriptionService.cancelSubscription(user.id);
          await loadStatus();
      } catch(err) {
          console.error(err);
      } finally {
          setProcessing(false);
      }
  };

  if (loading && !status) return <div className="p-4"><Spinner /></div>;

  return (
    <div className="unir-card p-6 mt-2">
      <h2 className="text-xl font-semibold text-[rgba(0,0,0,0.9)] mb-4">Unir Premium</h2>
      
      {error && <div className="text-red-500 mb-2">{error}</div>}

      {status?.active ? (
        <div>
           <div className="bg-green-50 p-4 rounded-md border border-green-200 mb-4">
             <p className="text-green-800 font-medium">✨ You are a Premium Member</p>
             <p className="text-sm text-green-600 mt-1">
                Valid until: {status.expiresAt ? new Date(status.expiresAt).toLocaleDateString() : "Lifetime"}
             </p>
           </div>
           <button 
             onClick={handleCancel} 
             disabled={processing}
             className="text-red-600 font-medium text-sm hover:underline"
           >
             Cancel Subscription
           </button>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-[rgba(0,0,0,0.6)]">
             Upgrade to Premium to get exclusive access to network insights, job boosts, and more.
          </p>
          <div className="flex items-center gap-4">
              <span className="text-2xl font-bold">₹99 <span className="text-sm font-normal text-gray-500">/ month</span></span>
              
              <button 
                onClick={handleUpgrade}
                disabled={processing}
                className="px-6 py-2 bg-[#e7a33e] text-white font-semibold rounded-full hover:bg-[#d6932e] disabled:opacity-50"
              >
                {processing ? "Processing..." : "Try Premium for free"}
              </button>
          </div>
        </div>
      )}
    </div>
  );
}
