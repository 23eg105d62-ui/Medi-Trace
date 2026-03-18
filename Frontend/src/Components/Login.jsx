import { useState } from "react";
import { loginUser } from "../api/index";

export default function Login({ onToggle, onSuccess, setToast }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setToast("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const res = await loginUser({ email, password });
            localStorage.setItem("token", res.data.token);
            setToast("Welcome back!");
            onSuccess(res.data.payload); 
        } catch (err) {
            setToast(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card">
            <div className="auth-header">
                <div className="logo-icon small">+</div>
                <h2>Welcome Back</h2>
                <p>Access your MediTrace account</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="modal-field">
                    <label className="modal-label">Email Address</label>
                    <input 
                        type="email" 
                        className="modal-input" 
                        placeholder="name@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="modal-field">
                    <label className="modal-label">Password</label>
                    <input 
                        type="password" 
                        className="modal-input" 
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn-submit auth-btn" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In →"}
                </button>
            </form>

            <div className="auth-footer">
                Don't have an account? <button className="auth-link" onClick={onToggle}>Register</button>
            </div>
        </div>
    );
}
