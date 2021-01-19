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
import { Provider, useDispatch, useSelector } from 'react-redux';
import { RootState, store } from './store/store';
import { addData } from './store/data-slice';

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
  const [clickCounter, setClickCounter] = useState(0);

  const data = useSelector((state: RootState) => state.data);
  const dispatch = useDispatch();

  async function doX(data: any) {
    await delay(250 + Math.random() * 1000);
    dispatch(addData({ id: data.id, value: data.value }));
  }

  const queue = useQueue();
  const queueSize = useQueueSize();
  const { register, unregister } = useRegister();

  const online = useOnlineStatus();

  useEffect(() => {
    register('recordData', doX);

    return () => {
      unregister('recordData');
    };
  }, []);

  return (
    <>
      <button
        onClick={() => {
          queue('recordData', {
            id: Date.now(),
            value: Math.round(Math.random() * 15 + 10),
          });
          setClickCounter((p) => p + 1);
        }}
      >
        add recording
      </button>
      <hr />
      {data && data.length > 0 ? (
        <>
          <div>size: {data.length}</div>
          <div>
            {data.map((d) => (
              <div key={d.id}>
                {d.id}: {d.value}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>no data</p>
      )}
      <hr />
      <p>click count: {clickCounter}</p>
      <p>online: {online ? 'true' : 'false'}</p>
      <p>queue size: {queueSize}</p>
    </>
  );
}

export default App;
