import React, {
  createContext,
  ReactChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useOnlineStatus } from './offline-hooks';

interface OfflineContextValue {
  register(key: string, fn: Function): void;
  unregister(key: string): void;
  queue(key: string, data: any): void;

  queueList: QueueList;
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
  status: QueueStatus;
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
  return null;
}

interface Props {
  children: React.ReactNode;
}
export function OfflineProvider({ children }: Props) {
  const online = useOnlineStatus();
  const mapRef = useRef<Mapping>({});

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

  function queue(key: string, data: any) {
    if (!mapRef.current[key]) {
      throw new Error(`no mapping for ${key}`);
    }

    const el: QueueElement = {
      key,
      data,
      status: QueueStatus.pending,
    };

    setCounter((p) => p + 1);
    setQueueList((p) => [...p, el]);
  }

  async function process() {
    for (const element of queueList) {
      if (
        mapRef.current[element.key] &&
        element.status === QueueStatus.pending
      ) {
        try {
          await mapRef.current[element.key].fn(element.data);

          // is this OK
          // mutate a reference inside of an array tracked by
          // useState seems very bad
          element.status = QueueStatus.done;

          persist(queueList);
        } catch (err) {
          console.error(err);
        }
      }
    }

    // filters the list so it does not grow too big with all of these done entries
    const pendingQueueList = queueList.filter(
      (el) => el.status === QueueStatus.pending,
    );
    setQueueList(pendingQueueList);
    persist(pendingQueueList);
  }

  useEffect(() => {
    if (!online) {
      console.info('offline provider: not online');
      return;
    }

    if (!inflated) {
      console.info('offline provider: queue not inflated yet');
      return;
    }

    persist(queueList);
    process().then(() => {
      console.info('offline provider: processing done');
    });
  }, [counter, online]);

  useEffect(() => {
    const stored = inflate();
    if (stored) {
      setInflated(true);
      setCounter((p) => p + 1);
      setQueueList(stored);
      console.info('offline provider: queue inflated');
    }
  }, []);

  const value = { queueList, queue, register, unregister };

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

export function useQueueSize() {
  const { queueList } = useOfflineQueue();
  return queueList.length;
}
