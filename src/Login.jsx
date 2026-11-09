import { useState } from 'react';
import axiosClient from './api/axiosClient';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Spring Security ждёт application/x-www-form-urlencoded
            const params = new URLSearchParams();
            params.append('username', username);
            params.append('password', password);

            await axiosClient.post('/auth/login', params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            onLogin(); // уведомляем App
        } catch (err) {
            setError('Неверный логин или пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="login-field">
                    <label htmlFor="login-username">Username</label>
                    <input
                        id="login-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Admin / Fil / Bob"
                        autoComplete="username"
                        required
                    />
                </div>
                <div className="login-field">
                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        autoComplete="current-password"
                        required
                    />
                </div>
                <button type="submit" className="loginBtn" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}

export default Login;