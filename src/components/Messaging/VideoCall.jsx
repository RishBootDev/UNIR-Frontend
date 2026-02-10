import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from "lucide-react";
import { getAccessToken, getUserId } from "@/auth/authStorage";

const VIDEO_API_URL = "http://localhost:5002"; 

const VideoCall = ({ activeCall, onClose, isIncoming, callerInfo }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState("connecting"); // connecting, connected, ended

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  const userId = getUserId();

  useEffect(() => {
    // Initialize Socket
    socketRef.current = io(VIDEO_API_URL, {
      auth: { id: String(userId), name: "User" }, 
    });

    socketRef.current.on("call:incoming", handleIncomingCall);
    socketRef.current.on("call:accepted", handleCallAccepted);
    socketRef.current.on("call:rejected", handleCallRejected);
    socketRef.current.on("call:ended", handleCallEnded);
    socketRef.current.on("webrtc:offer", handleOffer);
    socketRef.current.on("webrtc:answer", handleAnswer);
    socketRef.current.on("webrtc:ice", handleIceCandidate);

    startLocalStream();

    return () => {
      cleanup();
    };
  }, []);

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      if (!isIncoming && activeCall) {
       
        callUser(activeCall.receiverId);
      }
    } catch (err) {
      console.error("Failed to access media devices", err);
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        
        const targetId = isIncoming ? callerInfo.callerId : activeCall.receiverId;
        socketRef.current.emit("webrtc:ice", {
          to: targetId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (localStream) {
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    }

    peerConnectionRef.current = pc;
    return pc;
  };

  const callUser = (receiverId) => {
    socketRef.current.emit("call:user", { receiverId });
    setCallStatus("calling");
  };

  const handleIncomingCall = (data) => {
     };

  const acceptCall = async () => {
    setCallStatus("connected");
    const pc = createPeerConnection();

    socketRef.current.emit("call:accept", { callerId: callerInfo.callerId });
  };
  
  const handleCallAccepted = async () => {
    setCallStatus("connected");
    const pc = createPeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    socketRef.current.emit("webrtc:offer", { 
        to: activeCall.receiverId,
        offer
    });
  };
  
  const handleOffer = async ({ from, offer }) => {
     
     let pc = peerConnectionRef.current;
     if(!pc) pc = createPeerConnection();
     
     await pc.setRemoteDescription(new RTCSessionDescription(offer));
     const answer = await pc.createAnswer();
     await pc.setLocalDescription(answer);
     
     socketRef.current.emit("webrtc:answer", {
         to: from,
         answer
     });
  };

  const handleAnswer = async ({ from, answer }) => {
      const pc = peerConnectionRef.current;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleIceCandidate = async ({ from, candidate }) => {
      const pc = peerConnectionRef.current;
      if(pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
  };
  
  const handleCallRejected = () => {
      setCallStatus("rejected");
      setTimeout(onClose, 2000);
  };
  
  const handleCallEnded = () => {
      setCallStatus("ended");
      setTimeout(onClose, 2000);
  };

  const endCall = () => {
      // Notify peer
      const targetId = isIncoming ? callerInfo?.callerId : activeCall?.receiverId;
      if(targetId) {
          socketRef.current.emit("call:end", { to: targetId });
      }
      onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-5xl aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Local Video */}
        <div className="absolute top-4 right-4 w-48 aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg z-10">
           <video
             ref={localVideoRef}
             autoPlay
             playsInline
             muted
             className="w-full h-full object-cover"
           />
        </div>

        {/* Status Overlay */}
        {callStatus !== "connected" && !isIncoming && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-700 rounded-full mb-4 flex items-center justify-center">
                        <span className="text-3xl">👤</span>
                    </div>
                    <p className="text-white text-xl font-semibold capitalize">{callStatus}...</p>
                </div>
            </div>
        )}

        {/* Incoming Call Overlay */}
        {isIncoming && callStatus === "connecting" && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-30">
                 <div className="text-center mb-8">
                     <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                        {callerInfo?.callerAvatar ? (
                            <img src={callerInfo.callerAvatar} className="w-full h-full object-cover" />
                        ) : (
                             <span className="text-4xl text-white">👤</span>
                        )}
                     </div>
                     <h3 className="text-white text-2xl font-bold">{callerInfo?.callerName || "Unknown"} is calling...</h3>
                 </div>
                 <div className="flex gap-8">
                     <button onClick={endCall} className="p-4 bg-red-500 rounded-full hover:bg-red-600 transition shadow-lg transform hover:scale-110">
                         <PhoneOff className="w-8 h-8 text-white"/>
                     </button>
                     <button onClick={acceptCall} className="p-4 bg-green-500 rounded-full hover:bg-green-600 transition shadow-lg transform hover:scale-110 animate-bounce">
                         <Phone className="w-8 h-8 text-white"/>
                     </button>
                 </div>
             </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20 px-6 py-3 bg-gray-800/80 backdrop-blur rounded-full border border-gray-700">
             <button 
                onClick={() => { 
                    const enabled = !isMuted;
                    setIsMuted(enabled);
                    if(localStream) localStream.getAudioTracks()[0].enabled = !enabled; 
                }} 
                className={`p-4 rounded-full transition ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`}
             >
                 {isMuted ? <MicOff className="w-6 h-6 text-white"/> : <Mic className="w-6 h-6 text-white"/>}
             </button>
             
             <button onClick={endCall} className="p-4 bg-red-600 rounded-full hover:bg-red-700 transition shadow-lg transform hover:scale-105">
                 <PhoneOff className="w-6 h-6 text-white transform rotate-0"/>
             </button>
             
             <button 
                onClick={() => { 
                    const enabled = !isVideoOff;
                    setIsVideoOff(enabled);
                    if(localStream) localStream.getVideoTracks()[0].enabled = !enabled; 
                }} 
                className={`p-4 rounded-full transition ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`}
             >
                 {isVideoOff ? <VideoOff className="w-6 h-6 text-white"/> : <Video className="w-6 h-6 text-white"/>}
             </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
