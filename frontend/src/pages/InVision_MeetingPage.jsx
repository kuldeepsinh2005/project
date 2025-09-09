import React from "react";
import { useParams } from "react-router-dom";
import {ZegoUIKitPrebuilt} from '@zegocloud/zego-uikit-prebuilt';
export default function MeetingPage() {
  const { meetingId } = useParams();
  
  const myMeeting = async (element) => {
  const appIDString = import.meta.env.VITE_ZEGO_APP_ID;
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appIDString, serverSecret, meetingId, Date.now().toString(), "CosmoMeet User");
  
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: 'Copy Link',
          url: `http://localhost:5173/test/video/${meetingId}`,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
    });
  
  
  }



  return <>
    <h1>  Meeting Page - {meetingId}</h1>
    <div ref={myMeeting} ></div>
  </>;
}
