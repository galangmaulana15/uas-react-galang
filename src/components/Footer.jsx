import React from 'react'
import { Link } from 'react-router-dom'
import {
  Film,
  Github,
  Twitter,
  Facebook,
  Instagram,
  Mail
} from 'lucide-react'

// ================================
// FOOTER COMPONENT
// ================================
const Footer = () => {
  const currentYear = new Date().getFullYear()

  // ================================
  // HANDLER LINK EKSTERNAL
  // ================================
  const openExternal = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-slate-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">

        <div className="grid md:grid-cols-4 gap-8">

          {/* LOGO & DESKRIPSI */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Film className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                RoncoMovie
              </span>
            </Link>

            <p className="text-gray-400 mb-6">
              Your ultimate destination for discovering, tracking,
              and enjoying movies from around the world.
            </p>

            {/* SOCIAL MEDIA (EKSTERNAL → BUTTON) */}
            <div className="flex gap-4">
              <button
                onClick={() => openExternal('https://github.com/galangmaulana15')}
                className="text-gray-400 hover:text-white"
              >
                <Github size={20} />
              </button>

              <button
                onClick={() => openExternal('https://twitter.com')}
                className="text-gray-400 hover:text-white"
              >
                <Twitter size={20} />
              </button>

              <button
                onClick={() => openExternal('https://facebook.com')}
                className="text-gray-400 hover:text-white"
              >
                <Facebook size={20} />
              </button>

              <button
                onClick={() =>
                  openExternal('https://www.instagram.com/gggllngg_?igsh=c3lla2I1aTNlc2Z4')
                }
                className="text-gray-400 hover:text-white"
              >
                <Instagram size={20} />
              </button>
            </div>
          </div>

          {/* QUICK LINKS (INTERNAL) */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link to="/movies" className="text-gray-400 hover:text-white">Movies</Link></li>
              <li><Link to="/favorites" className="text-gray-400 hover:text-white">Favorites</Link></li>
              <li><Link to="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link></li>
            </ul>
          </div>

          {/* CATEGORIES (INTERNAL + QUERY PARAM) */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/movies?category=popular" className="text-gray-400 hover:text-white">
                  Popular Movies
                </Link>
              </li>
              <li>
                <Link to="/movies?category=top_rated" className="text-gray-400 hover:text-white">
                  Top Rated
                </Link>
              </li>
              <li>
                <Link to="/movies?category=upcoming" className="text-gray-400 hover:text-white">
                  Upcoming
                </Link>
              </li>
              <li>
                <Link to="/movies?category=now_playing" className="text-gray-400 hover:text-white">
                  Now Playing
                </Link>
              </li>
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest movie updates.
            </p>

            <form className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 my-8" />

        {/* BOTTOM BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-gray-400">
            © {currentYear} RoncoMovie. All rights reserved.
          </p>

          {/* POLICY (BELUM ADA HALAMAN → BUTTON) */}
          <div className="flex gap-6 mt-4 md:mt-0">
            <button className="text-gray-400 hover:text-white">Privacy Policy</button>
            <button className="text-gray-400 hover:text-white">Terms of Service</button>
            <button className="text-gray-400 hover:text-white">Cookie Policy</button>
            <button className="text-gray-400 hover:text-white">Contact Us</button>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Ronco Movie</p>
          <p className="mt-2">Stream movies, explore stories, and enjoy the show.</p>
        </div>

      </div>
    </footer>
  )
}

export default Footer
