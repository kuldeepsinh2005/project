import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
export default function TestPage() {
    let navigate=useNavigate()
    let [input, setInput]=useState("")
    function handleJoin(){
        navigate(`/room/${input}`)
    }
    return (
        <div id='home'>
            <input type="text" placeholder='enter room id' value={input} onChange={(e)=>setInput(e.target.value)}/>
            <button onClick={handleJoin}>Join Now</button>
        </div>
    )
}