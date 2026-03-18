import { useState } from 'react';
import { verifyReport } from '../api/index';

export default function VerifyButton({ reportId, initialCount, coords }) {
    const [count, setCount] = useState(initialCount);
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (verified || loading) return;
        setLoading(true);
        try {
            const res = await verifyReport(reportId, {
                lng: coords?.lng,
                lat: coords?.lat
            });
            setCount(res.data.verifications);
            setVerified(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleVerify}
            disabled={verified || loading}
            style={{
                marginTop: 8,
                padding: '4px 14px',
                borderRadius: 6,
                border: '1px solid rgba(0,232,122,0.3)',
                background: verified ? '#00e87a' : 'rgba(0,232,122,0.1)',
                color: verified ? '#0a0f0d' : '#00e87a',
                cursor: verified ? 'default' : 'pointer',
                fontSize: 12
            }}
        >
            {loading ? 'Verifying…' : verified ? `✓ Verified (${count})` : `✓ Verify (${count})`}
        </button>
    );
}