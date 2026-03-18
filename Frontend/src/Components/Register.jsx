import { useState } from "react";
import { registerUser } from "../api/index";

export default function Register({ onToggle, onSuccess, setToast }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) {
            setToast("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            await registerUser({ name, email, password });
            setToast("Account created! Please login.");
            onToggle(); 
        } catch (err) {
            setToast(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card">
            <div className="auth-header">
                <div className="logo-icon small">+</div>
                <h2>Create Account</h2>
                <p>Join the MediTrace community</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="modal-field">
                    <label className="modal-label">Full Name</label>
                    <input 
                        type="text" 
                        className="modal-input" 
                        placeholder="John Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </div>

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
                    {loading ? "Creating account..." : "Register →"}
                </button>
            </form>

            <div className="auth-footer">
                Already have an account? <button className="auth-link" onClick={onToggle}>Login</button>
            </div>
        </div>
    );
}
