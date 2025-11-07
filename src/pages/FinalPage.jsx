import React, { useEffect, useState } from "react";
import { getLetGoCount } from "../firebase";

const FinalPage = ({ style }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let mounted = true;
        const fetchCount = async () => {
            const val = await getLetGoCount();
            if (mounted) setCount(val);
        };
        fetchCount();
        // Optionally, poll for updates
        const interval = setInterval(fetchCount, 5000);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);
    return (
        <div id="FinalPage" style={style}>
            Let go count: {count}
        </div>
    );
};

export default FinalPage;
