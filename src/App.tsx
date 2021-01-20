import delay from 'delay';
import React, { useState, useEffect, ReactChildren, useRef } from 'react';
import './App.css';
import {
  OfflineProvider,
  useQueue,
  useQueueLength,
  useRegister,
} from './offline';
import { useOnlineStatus } from './offline-hooks';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { RootState, store } from './store/store';
import { addData, clearData } from './store/data-slice';

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
          <OfflineQueueUi />
          <hr />
          <OfflineActionWidget />
          <hr />
          <GlobalStateStoreWidget />
        </div>
      </OfflineProvider>
    </Provider>
  );
}

interface OfflineQueueUiProps {}
function OfflineQueueUi({}: OfflineQueueUiProps) {
  const online = useOnlineStatus();
  const { register, unregister } = useRegister();
  const queueSize = useQueueLength();

  const dispatch = useDispatch();

  async function doX(data: any) {
    await delay(250 + Math.random() * 1000);
    dispatch(addData({ id: data.id, value: data.value }));
  }

  // register the actions
  useEffect(() => {
    register('recordData', doX);

    return () => {
      unregister('recordData');
    };
  }, []);

  return (
    <>
      <p>This is debug info.</p>
      <p>online: {online ? 'true' : 'false'}</p>
      <p>queue size: {queueSize}</p>
    </>
  );
}

function OfflineActionWidget() {
  const queue = useQueue();

  const [clickCounter, setClickCounter] = useState(0);

  async function handleAddRecording() {
    await queue('recordData', {
      id: Date.now(),
      value: (clickCounter % (15 + 1)) + 10,
    });
    setClickCounter((p) => p + 1);
  }

  return (
    <div>
      <p>
        This widget represents a screen that submits some data via xhr to a
        server. This is simulated in this example.
      </p>
      <div>
        <button onClick={handleAddRecording}>add recording</button>
      </div>
      <p>click count: {clickCounter}</p>
    </div>
  );
}

function GlobalStateStoreWidget() {
  const dispatch = useDispatch();
  const data = useSelector((state: RootState) => state.data);

  function handleClear(event: React.MouseEvent) {
    event.preventDefault();
    dispatch(clearData());
  }

  return (
    <div>
      <p>
        This widget represents some ui component that is powered by state from
        redux.
      </p>
      <p>
        This one is rendering a list of objects, with a tsid and an arbitrary
        value. You can{' '}
        <a href="#" onClick={handleClear}>
          clear this list
        </a>
        .
      </p>
      {data && data.length > 0 ? (
        <>
          <div>size: {data.length}</div>
          <div>
            {[...data].reverse().map((d) => (
              <div key={d.id}>
                {d.id}: {d.value}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>no data</p>
      )}
    </div>
  );
}

export default App;
