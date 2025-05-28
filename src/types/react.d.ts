import 'react';

declare module 'react' {
  export interface FormEvent<T = Element> extends SyntheticEvent<T> {}
  export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T;
  }
  export interface KeyboardEvent<T = Element> extends SyntheticEvent<T> {
    altKey: boolean;
    charCode: number;
    ctrlKey: boolean;
    key: string;
    keyCode: number;
    locale: string;
    location: number;
    metaKey: boolean;
    repeat: boolean;
    shiftKey: boolean;
    which: number;
  }
  
  export interface SyntheticEvent<T = Element, E = Event> {
    bubbles: boolean;
    cancelable: boolean;
    currentTarget: EventTarget & T;
    defaultPrevented: boolean;
    eventPhase: number;
    isTrusted: boolean;
    nativeEvent: E;
    preventDefault(): void;
    stopPropagation(): void;
    target: EventTarget;
    timeStamp: number;
    type: string;
  }
  
  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
  
  export function useEffect(effect: EffectCallback, deps?: DependencyList): void;
  
  export function useRef<T>(initialValue: T): MutableRefObject<T>;
  export function useRef<T>(initialValue: T | null): RefObject<T>;
  export function useRef<T = undefined>(): MutableRefObject<T | undefined>;
  
  export type SetStateAction<S> = S | ((prevState: S) => S);
  export type Dispatch<A> = (value: A) => void;
  export type EffectCallback = () => void | (() => void);
  export type DependencyList = ReadonlyArray<unknown>;
  
  export interface MutableRefObject<T> {
    current: T;
  }
  
  export interface RefObject<T> {
    readonly current: T | null;
  }
} 