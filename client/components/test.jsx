import React from 'react'
import { useRealtime } from './RealtimeContext';

function Test() {
      const { sendClientEvent, isSessionActive, functionCalls,events } = useRealtime();

      console.log(events)
    
  
}

export default Test