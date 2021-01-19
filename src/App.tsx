import delay from 'delay';
import React, { useState, useEffect, ReactChildren, useRef } from 'react';
import './App.css';
import { OfflineProvider, useOffline } from './offline';
import { useOnlineStatus } from './offline-hooks';

interface ProvidersProps {
  children: React.ReactNode;
}

function Providers({ children }: ProvidersProps) {
  return <>{children}</>;
}

interface AppProps {}
function App({}: AppProps) {
  const [x, setX] = useState(-10);
  const [y, setY] = useState(10);

  async function doX(data: any) {
    await delay(250 + Math.random() * 1000);
    setX((p) => p + data.value);
  }

  async function doY(data: any) {
    await delay(250 + Math.random() * 1000);
    setY((p) => p + data.value);
  }

  const registeration = {
    addx: { key: 'addx', fn: doX },
    addy: { key: 'addy', fn: doY },
  };

  return (
    <OfflineProvider registeration={registeration}>
      <div className="App">
        <UserInterface x={x} y={y} />
      </div>
    </OfflineProvider>
  );
}

interface UserInterfaceProps {
  x: number;
  y: number;
}
function UserInterface({ x, y }: UserInterfaceProps) {
  const { queue } = useOffline();
  const online = useOnlineStatus();
  return (
    <>
      <button
        onClick={() => {
          queue('addx', { value: 1 });
        }}
      >
        add x
      </button>
      <button
        onClick={() => {
          queue('addy', { value: 1 });
        }}
      >
        add y
      </button>
      <hr />
      <p>x: {x}</p>
      <p>y: {y}</p>
      <hr />
      <p>online: {online ? 'true' : 'false'}</p>
    </>
  );
}

export default App;
