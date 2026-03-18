import { useEffect, useState } from "react";

export default function Toast({ message }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!message) return;
        setShow(true);

        const t = setTimeout(() => setShow(false), 3000);
        return () => clearTimeout(t);
    }, [message]);

    return (
        <div className={`toast ${show ? "show" : ""}`}>
            {message}
        </div>
    );
}