import React from "react";
import { useParams } from "react-router-dom";
import {ZegoUIKitPrebuilt} from '@zegocloud/zego-uikit-prebuilt';
export default function MeetingPage() {
  const { meetingId } = useParams();
  
  const myMeeting = async (element) => {
    const appId = 293412303;
    const serverSecret = "5ab0771a57b7fabc881860669da2265e";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appId, serverSecret, meetingId, Date.now().toString(), "CosmoMeet User");
  
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: 'Copy Link',
          url: `http://localhost:5173/meeting/${meetingId}`,
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
