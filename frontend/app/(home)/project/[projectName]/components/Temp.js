// App.js
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:8000');

function App() {
  const [missionStatus, setMissionStatus] = useState(null);
  const [missionResponse, setMissionResponse] = useState(null);

  useEffect(() => {
    // 监听任务状态
    socket.on('mission_status_response', (data) => {
      setMissionStatus(data);
    });

    // 监听任务执行结果
    socket.on('mission_response', (data) => {
      setMissionResponse(data);
    });

    // 清理事件监听器
    return () => {
      socket.off('mission_status_response');
      socket.off('mission_response');
    };
  }, []);

  const getMissionStatus = (projectName) => {
    socket.emit('get_mission_status', { project_name: projectName });
  };

  const sendMission = (missionData) => {
    socket.emit('send_mission', missionData);
  };

  return (
    <div>
      <h1>Socket.IO 前端示例</h1>
      <button onClick={() => getMissionStatus('example_project')}>获取任务状态</button>
      <button onClick={() => sendMission({ mission: 'example_mission' })}>发送任务</button>
      <div>
        <h2>任务状态</h2>
        <pre>{JSON.stringify(missionStatus, null, 2)}</pre>
      </div>
      <div>
        <h2>任务响应</h2>
        <pre>{JSON.stringify(missionResponse, null, 2)}</pre>
      </div>
    </div>
  );
}

export default App;