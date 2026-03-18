export default function Header({ user, onSignIn, onLogout, onOpenModal, reportCount = 0 }) {
    return (
        <header>
            <div className="logo">
                <div className="logo-icon">+</div>
                <div className="logo-text">Medi<span>Trace</span></div>
            </div>
            <div className="header-right">
                <div className="live-badge">
                    <div className="live-dot"></div>
                    LIVE · {reportCount} reports today
                </div>

                {user ? (
                    <div className="header-user">
                        <span className="user-name">{user.name}</span>
                        <button className="logout-btn" onClick={onLogout}>Logout</button>
                    </div>
                ) : (
                    <button className="sign-in-btn" onClick={onSignIn}>Sign In</button>
                )}
                <button className="report-btn" onClick={onOpenModal}>
                    + Report Availability
                </button>
            </div>
        </header>
    );
}