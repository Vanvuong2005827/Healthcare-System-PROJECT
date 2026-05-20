import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const RoomPage = () => {
  const { roomId } = useParams();
  const roomRef = useRef(null);
  let zp = useRef(null); // Use useRef to maintain the zp instance

  useEffect(() => {
    const appId = 755664054;
    const serverSecret = "1671fc16f6292af0423aefb7e36d2fe4";
    const userName = "Enter user name";

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appId,
      serverSecret,
      roomId,
      Date.now().toString(),
      userName
    );

    zp.current = ZegoUIKitPrebuilt.create(kitToken);

    zp.current.joinRoom({
      container: roomRef.current,
      scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
    });

    return () => {
      if (zp.current && zp.current.leaveRoom) {
        zp.current.leaveRoom();
      }
    };
  }, [roomId]);

  return (
    <div className="room-page">
      <div ref={roomRef} style={{ width: "100%", height: "100vh" }} />
    </div>
  );
};

export default RoomPage;
