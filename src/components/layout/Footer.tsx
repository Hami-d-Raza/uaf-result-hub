import { Link } from "react-router-dom";
import { GraduationCap, Github, Linkedin, Mail, Heart } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[hsl(269,40%,16%)] dark:bg-[hsl(269,50%,8%)] text-white mt-auto">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
                    {/* Brand Column */}
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-lg text-white">UAF Result Hub</span>
                        </Link>
                        <p className="text-sm text-white/70 leading-relaxed mb-4">
                            A comprehensive result management system designed specifically for University of Agriculture, Faisalabad students to track their academic progress.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="text-white/70 hover:text-white transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/smart-search" className="text-white/70 hover:text-white transition-colors">
                                    Smart Search
                                </Link>
                            </li>
                            <li>
                                <Link to="/individual" className="text-white/70 hover:text-white transition-colors">
                                    Individual Result
                                </Link>
                            </li>
                            <li>
                                <Link to="/class" className="text-white/70 hover:text-white transition-colors">
                                    Class Result
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Support</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/contact" className="text-white/70 hover:text-white transition-colors">
                                    Report a Bug
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-white/70 hover:text-white transition-colors">
                                    Feature Request
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="http://www.uaf.edu.pk/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white/70 hover:text-white transition-colors"
                                >
                                    UAF Official Site
                                </a>
                            </li>
                            <li>
                                <Link to="/privacy-policy" className="text-white/70 hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal / Social */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Connect</h3>
                        <div className="flex gap-4 mb-4">
                            <a href="https://github.com/Hami-d-Raza" aria-label="GitHub Profile" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-[hsl(269,50%,8%)] transition-colors border border-white/20">
                                <Github className="h-4 w-4" />
                            </a>
                            <a href="https://www.linkedin.com/in/muhammad-hamid-raza-/" aria-label="LinkedIn Profile" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-[hsl(269,50%,8%)] transition-colors border border-white/20">
                                <Linkedin className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-6 flex justify-center text-xs text-white/50">
                    <p>Built by <a href="https://www.linkedin.com/in/muhammad-hamid-raza-/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 hover:underline font-medium transition-colors">Muhammad Hamid Raza</a> • © {currentYear} All Rights Reserved</p>
                </div>
            </div>
        </footer>
    );
}
