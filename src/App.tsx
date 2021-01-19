import delay from 'delay';
import React, { useState, useEffect, ReactChildren, useRef } from 'react';
import './App.css';
import {
  OfflineProvider,
  useQueue,
  useQueueSize,
  useRegister,
} from './offline';
import { useOnlineStatus } from './offline-hooks';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store/store';

interface ProvidersProps {
  children: React.ReactNode;
}

function Providers({ children }: ProvidersProps) {
  return <>{children}</>;
}

interface AppProps {}
function App({}: AppProps) {
  return (
    <Provider store={store}>
      <OfflineProvider>
        <div className="App">
          {/* pretend this is a route screen */}
          <UserInterface />
        </div>
      </OfflineProvider>
    </Provider>
  );
}

interface UserInterfaceProps {}
function UserInterface({}: UserInterfaceProps) {
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

  const queue = useQueue();
  const queueSize = useQueueSize();
  const { register, unregister } = useRegister();

  const online = useOnlineStatus();

  useEffect(() => {
    register('addx', doX);
    register('addy', doY);

    return () => {
      unregister('addx');
      unregister('addy');
    };
  }, []);

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
      <p>queue size: {queueSize}</p>
    </>
  );
}

export default App;
