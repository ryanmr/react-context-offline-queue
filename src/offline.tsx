import React, {
  createContext,
  ReactChildren,
  Ref,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useOnlineStatus } from './offline-hooks';

enum QueueResultMode {
  online = 'online',
  offline = 'offline',
}

interface QueueResult {
  mode: QueueResultMode;
  element: QueueElement;
}

interface OfflineContextValue {
  register(key: string, fn: Function): void;
  unregister(key: string): void;
  queue(key: string, data: any): Promise<QueueResult>;

  queueRef: Ref<QueueList>;
  queueLength: number;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

interface MappingElement {
  key: string;
  fn: Function;
}

interface Mapping {
  [key: string]: MappingElement;
}

enum QueueStatus {
  pending = 'pending',
  done = 'done',
}

interface QueueElement {
  key: string;
  data: any;
}

type QueueList = QueueElement[];

function persist(queueList: QueueList) {
  window.localStorage.setItem('_offline_actions', JSON.stringify(queueList));
}

function inflate() {
  const content = window.localStorage.getItem('_offline_actions');
  if (content) {
    const data = JSON.parse(content);
    return data;
  }
  return [];
}

interface Props {
  children: React.ReactNode;
}
export function OfflineProvider({ children }: Props) {
  const online = useOnlineStatus();
  const mapRef = useRef<Mapping>({});
  const queueRef = useRef<QueueList>([]);

  const [counter, setCounter] = useState(0);
  const [inflated, setInflated] = useState(false);
  const [queueList, setQueueList] = useState<QueueList>([]);

  function register(key: string, fn: Function) {
    const el: MappingElement = {
      key,
      fn,
    };
    mapRef.current[key] = el;
  }

  function unregister(key: string) {
    delete mapRef.current[key];
  }

  async function queue(key: string, data: any): Promise<QueueResult> {
    if (!mapRef.current[key]) {
      throw new Error(`no mapping for ${key}`);
    }

    const element: QueueElement = {
      key,
      data,
    };

    let mode = QueueResultMode.online;
    if (online) {
      await mapRef.current[element.key].fn(element.data);
      mode = QueueResultMode.online;
    } else {
      queueRef.current.push(element);
      mode = QueueResultMode.offline;
    }

    setCounter((p) => p + 1);
    return { mode, element };
  }

  async function dequeue() {
    const copyQueue = [...queueRef.current];

    for (const element of copyQueue) {
      if (mapRef.current[element.key]) {
        try {
          console.log('trying to process element', element);
          await mapRef.current[element.key].fn(element.data);

          queueRef.current.shift();
          setCounter((p) => p + 1);
        } catch (err) {
          console.error(err);
        }
      }
    }

    // setCounter((p) => p + 1);
  }

  useEffect(() => {
    if (!inflated) {
      console.info('offline provider: (persist) queue not inflated yet');
      return;
    }

    persist(queueRef.current);
  }, [counter]);

  useEffect(() => {
    if (!inflated) {
      console.info('offline provider: (dequeue) queue not inflated yet');
      return;
    }

    if (!online) {
      console.info('offline provider: not online');
      return;
    }

    dequeue().then(() => {
      console.info('offline provider: processing done');
    });
  }, [online, inflated]);

  useEffect(() => {
    const stored = inflate();
    if (stored) {
      setInflated(true);
      setCounter((p) => p + 1);
      queueRef.current = stored;
      console.info('offline provider: queue inflated');
    }
  }, []);

  const queueLength = queueRef.current.length;

  const value = { queueRef, queue, register, unregister, queueLength };

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  );
}

export function useOfflineQueue() {
  const context = useContext(OfflineContext) as OfflineContextValue;
  return context;
}

export function useQueue() {
  const { queue } = useOfflineQueue();
  return queue;
}

export function useRegister() {
  const { register, unregister } = useOfflineQueue();
  return { register, unregister };
}

export function useQueueLength() {
  const { queueLength } = useOfflineQueue();
  return queueLength;
}
