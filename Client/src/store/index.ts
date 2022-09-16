import create from "zustand";
import {devtools, persist} from "zustand/middleware";


const createStateSlice = (set: (arg0: { user: any; }, arg1: null, arg2: string) => any, get: any) => ({
    user: null,
    setUser: (user: any) => set({user}, null, "setUser"),
})


const createTokenSlice = (set: (arg0: { token: string | null; }, arg1: null, arg2: string) => any, get: any) => ({
    token: null,
    setToken: (token: string | null) => set({token}, null, "setToken"),
});

const createRootStorage = (set: (arg0: { token: string | null; }, arg1: null, arg2: string) => any, get: any) => ({
    ...createTokenSlice(set, get)
})

// @ts-ignore
export const useLocalStorage = create(devtools(persist(createRootStorage, {name: "token"})))

const createRootSlice = (set: (arg0: { user: any; }, arg1: null, arg2: string) => any, get: any) => ({
    ...createStateSlice(set, get),
});

// @ts-ignore
export const useStore = create(devtools(createRootSlice))
