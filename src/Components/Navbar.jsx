import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import {
  AiOutlineWhatsApp,
  AiOutlineFullscreen,
  AiOutlineFullscreenExit,
} from "react-icons/ai";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

const Navbar = ({ handleMenuClick }) => {
  const [isFullScreen, setIsFullScreen] = useState(false); // Fullscreen toggle state
  const [currentDateTime, setCurrentDateTime] = useState(
    new Date().toLocaleString()
  ); // Date & Time state
  const [activeLink, setActiveLink] = useState("Dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setIsFullScreen(!isFullScreen);
  };

  const handleNavigation = (path, linkName) => {
    setActiveLink(linkName); // Set the active link
    navigate(path);
  };

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        toast.success("Logged out successfully!");
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error during logout:", error);
        toast.error("Error logging out. Please try again.");
      });
  };

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <i
          className="bx bx-menu text-white cursor-pointer lg:hidden"
          onClick={handleMenuClick}
        ></i>
        <div className="text-2xl font-bold ml-4 lg:ml-0">Admin</div>
      </div>

      <div className="flex space-x-6 items-center">
        {/* Full-Screen Control */}
        <button
          onClick={toggleFullScreen}
          className="p-3 rounded-full hover:bg-gray-700"
        >
          {isFullScreen ? (
            <AiOutlineFullscreenExit size={24} />
          ) : (
            <AiOutlineFullscreen size={24} />
          )}
        </button>

        {/* Dashboard, Invoice Dashboard, HRM Dashboard Menus */}
        <div className="relative">
          <button
            onClick={() => handleNavigation("/", "Dashboard")}
            className="p-3 rounded-full hover:bg-gray-700"
          >
            Dashboard
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() =>
              handleNavigation("/invoicedashboard", "Invoice Dashboard")
            }
            className="p-3 rounded-full hover:bg-gray-700"
          >
            Invoice Dashboard
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => handleNavigation("/hrmdashboard", "HRM Dashboard")}
            className="p-3 rounded-full hover:bg-gray-700"
          >
            HRM Dashboard
          </button>
        </div>

        {/* WhatsApp Link */}
        <div
          className="relative"
          onMouseEnter={() => setActiveDropdown("whatsapp")}
          onMouseLeave={() => setActiveDropdown("")}
        >
          <a
            href="https://web.whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full hover:bg-gray-700 flex items-center justify-center"
          >
            <AiOutlineWhatsApp size={24} />
          </a>
        </div>

        {/* Profile as Direct Link */}
        <div className="relative">
          <button
            onClick={() => handleNavigation("/profile", "Profile")}
            className="p-3 rounded-full hover:bg-gray-700"
          >
            <FaUserCircle size={24} />
          </button>
        </div>

        {/* Date and Time Display (in Two Rows) */}
        <div className="text-lg text-white ml-4 flex flex-col items-center">
          <p>{new Date().toLocaleDateString()}</p>
          <p>{new Date().toLocaleTimeString()}</p>
        </div>

        {/* Logout */}
        <li className={activeLink === "logout" ? "active" : ""}>
          <Link
            to="#"
            onClick={() => {
              handleLogout();
              handleLinkClick("logout");
            }}
            style={{
              color: "red",
              fontWeight: "bold",
              marginTop: "5px",
            }}
            className="flex items-center"
          >
            <RiLogoutCircleRLine
              size={24}
              className="mr-2 hover:text-red-700 transition duration-200"
            />
            <span className="p-3 rounded-full text-red-500">Logout</span>
          </Link>
        </li>
      </div>
    </nav>
  );
};

export default Navbar;
