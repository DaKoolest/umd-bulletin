import { useState } from "react";

export function useModal<T>() {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "view">("create");
    const [data, setData] = useState<T | null>(null);

    const open = (mode: "create" | "view", data: T) => {
        setMode(mode);
        setData(data);
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        setData(null);
    };

    return { isOpen, mode, data, open, close };
}
