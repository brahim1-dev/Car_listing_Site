import {FaSearch } from "react-icons/fa"
import { Link } from "react-router-dom"

const Header = () => {
  return (
    <header className="bg-slate-200 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3" >
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate-500">Iftiinshe</span>
            <span className="text-slate-700">Auto</span>
          </h1>
        </Link>
        <form className="flex items-center bg-slate-100 rounded-lg p-3">
          <input 
            type="text" 
            placeholder="Search..."
            className="bg-transparent focus:outline-none w-24 ms:w-64"
          />
          <FaSearch className="text-slate-600" />
        </form>
        <ul className="flex gap-4">
          <Link className="hidden sm:inline text-slate-700 hover:underline" to="/">Home</Link>
          <Link className="text-slate-700 hover:underline" to="/about">About</Link>
          <Link className="text-slate-700 hover:underline" to="/sign-up">Sign Up</Link>
          <Link to="/profile">Profile</Link>
        </ul>
      </div>
    </header>
  )
}

export default Header