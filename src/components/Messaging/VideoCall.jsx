import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from "lucide-react";
import { getAccessToken, getUserId } from "@/auth/authStorage";

 

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
  const localStreamRef = useRef(null); // Track stream availability in ref

  const userId = getUserId();

  useEffect(() => {
    console.log("VideoCall component mounted, initializing socket");
    
    // Initialize Socket
    // Connect to current origin via proxy, with specific path
    socketRef.current = io({ 
      path: "/api/unir/video/socket.io",
      auth: { id: String(userId), name: "User" }, 
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected successfully, socket ID:", socketRef.current.id);
    });

    socketRef.current.on("call:incoming", handleIncomingCall);
    socketRef.current.on("call:accepted", handleCallAccepted);
    socketRef.current.on("call:rejected", handleCallRejected);
    socketRef.current.on("call:ended", handleCallEnded);
    socketRef.current.on("webrtc:offer", handleOffer);
    socketRef.current.on("webrtc:answer", handleAnswer);
    socketRef.current.on("webrtc:ice", handleIceCandidate);

    console.log("Socket event listeners registered");

    startLocalStream();

    return () => {
      console.log("VideoCall component unmounting, cleaning up");
      cleanup();
    };
  }, []);

  // Update remote video element when remote stream changes
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log("Setting remote stream to video element:", remoteStream);
      console.log("Remote stream tracks:", remoteStream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
      
      remoteVideoRef.current.srcObject = remoteStream;
      
      // Explicitly play the video
      remoteVideoRef.current.play()
        .then(() => console.log("Remote video playing successfully"))
        .catch(err => console.error("Failed to play remote video:", err));
    }
  }, [remoteStream]);

  // Add local stream tracks to peer connection when stream becomes available
  useEffect(() => {
    console.log("Track-adding useEffect triggered. localStream:", !!localStream, "peerConnection:", !!peerConnectionRef.current);
    
    if (localStream && peerConnectionRef.current) {
      console.log("Adding local stream tracks to peer connection (via useEffect)");
      const pc = peerConnectionRef.current;
      
      // Check if tracks are already added
      const senders = pc.getSenders();
      console.log("Current senders count:", senders.length);
      
      if (senders.length === 0) {
        localStream.getTracks().forEach((track) => {
          console.log("  - Adding track via useEffect:", track.kind, "enabled:", track.enabled);
          pc.addTrack(track, localStream);
        });
        console.log("Tracks added successfully via useEffect!");
      } else {
        console.log("Tracks already added, skipping");
      }
    }
  }, [localStream, peerConnectionRef.current]);

  const startLocalStream = async () => {
    try {
      console.log("Requesting media devices...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("Got local stream:", stream.getTracks().map(t => t.kind));
      setLocalStream(stream);
      localStreamRef.current = stream; // Also set ref
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      if (!isIncoming && activeCall) {
        console.log("Initiating call to:", activeCall.receiverId);
       
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
    console.log("Creating peer connection...");
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const targetId = isIncoming ? callerInfo.callerId : activeCall.receiverId;
        console.log("Sending ICE candidate to:", targetId);
        socketRef.current.emit("webrtc:ice", {
          to: targetId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("Received remote track:", event.track.kind, event.streams[0]);
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Add local stream tracks
    if (localStream) {
      console.log("Adding local stream tracks to peer connection:");
      localStream.getTracks().forEach((track) => {
        console.log("  - Adding track:", track.kind, "enabled:", track.enabled);
        pc.addTrack(track, localStream);
      });
    } else {
      console.warn("Local stream not available when creating peer connection!");
    }

    peerConnectionRef.current = pc;
    console.log("Peer connection created successfully");
    return pc;
  };

  const callUser = (receiverId) => {
    console.log("Emitting call:user to receiverId:", receiverId);
    socketRef.current.emit("call:user", { receiverId });
    setCallStatus("calling");
  };

  const handleIncomingCall = (data) => {
     };

  const acceptCall = async () => {
    console.log("Accepting call from:", callerInfo.callerId);
    setCallStatus("connected");
    
    // Wait for local stream to be available
    if (!localStreamRef.current) {
      console.log("Waiting for local stream before accepting call...");
      await new Promise(resolve => {
        const checkStream = setInterval(() => {
          if (localStreamRef.current) {
            clearInterval(checkStream);
            resolve();
          }
        }, 100);
      });
    }
    
    const pc = createPeerConnection();
    console.log("Peer connection created for incoming call");

    socketRef.current.emit("call:accept", { callerId: callerInfo.callerId });
    console.log("Emitted call:accept");
  };
  
  const handleCallAccepted = async () => {
    console.log("Call accepted! Creating offer...");
    setCallStatus("connected");
    
    // Wait for local stream to be available
    if (!localStreamRef.current) {
      console.log("Waiting for local stream before creating offer...");
      await new Promise(resolve => {
        const checkStream = setInterval(() => {
          if (localStreamRef.current) {
            clearInterval(checkStream);
            resolve();
          }
        }, 100);
      });
    }
    
    const pc = createPeerConnection();
    console.log("Peer connection created for accepted call");
    const offer = await pc.createOffer();
    console.log("Created offer:", offer.type);
    await pc.setLocalDescription(offer);
    
    socketRef.current.emit("webrtc:offer", { 
        to: activeCall.receiverId,
        offer
    });
    console.log("Sent offer to:", activeCall.receiverId);
  };
  
  const handleOffer = async ({ from, offer }) => {
     console.log("Received offer from:", from);
     
     let pc = peerConnectionRef.current;
     if(!pc) {
       console.log("No peer connection exists, creating one");
       pc = createPeerConnection();
     }
     
     await pc.setRemoteDescription(new RTCSessionDescription(offer));
     console.log("Set remote description (offer)");
     const answer = await pc.createAnswer();
     console.log("Created answer:", answer.type);
     await pc.setLocalDescription(answer);
     
     socketRef.current.emit("webrtc:answer", {
         to: from,
         answer
     });
     console.log("Sent answer to:", from);
  };

  const handleAnswer = async ({ from, answer }) => {
      console.log("Received answer from:", from);
      const pc = peerConnectionRef.current;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log("Set remote description (answer)");
  };

  const handleIceCandidate = async ({ from, candidate }) => {
      console.log("Received ICE candidate from:", from);
      const pc = peerConnectionRef.current;
      if(pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("Added ICE candidate");
      } else {
          console.warn("Received ICE candidate but no peer connection exists");
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
          muted={false}
          className="w-full h-full object-cover"
          onLoadedMetadata={(e) => {
            console.log("Remote video metadata loaded, attempting play");
            e.target.play().catch(err => console.error("Remote video play failed:", err));
          }}
        />
        
        {/* Debug Info */}
        {!remoteStream && callStatus === "connected" && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center">
            <p className="text-lg">Waiting for remote video...</p>
            <p className="text-sm opacity-70 mt-2">Check console for debug info</p>
          </div>
        )}
        
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
