import { useState, useEffect } from 'react';

export function useGeolocation() {
    const [coords, setCoords] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => setCoords({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            }),
            (err) => setError(err.message)
        );
    }, []);

    return { coords, error };
}