import React, { useEffect, useState } from "react";

function getSavedValue<T>(key: string, initial: T | (() => T)):T {
    const value = localStorage.getItem(key);
    if(value) return JSON.parse(value);
    if (initial instanceof Function) return initial(); 
    return initial;
}

export default function useLocalStorage<T>(key: string, initial: T | (() => T)): [T,React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState(() => getSavedValue(key, initial));

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [state]);

    return [state, setState];
}