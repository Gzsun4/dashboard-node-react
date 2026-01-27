import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setError('');
        setLoading(true);

        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center w-full h-full min-h-[80vh]">
            <div className="glass-card p-8 w-full max-w-md animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <UserPlus size={100} />
                </div>

                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>

                    {error && (
                        <div className="bg-danger-soft text-danger p-3 rounded-lg mb-4 text-center text-sm border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-secondary mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-secondary mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="input-field"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-secondary mb-1">Password</label>
                            <input
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-secondary mb-1">Confirm Password</label>
                            <input
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full justify-center mt-6"
                        >
                            {loading ? 'Creating Account...' : (
                                <>
                                    <UserPlus size={18} />
                                    Sign Up
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-secondary">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:text-white transition-colors font-medium">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
