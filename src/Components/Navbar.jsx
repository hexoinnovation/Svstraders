import React, { useState, useEffect,useRef, } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaUserCircle, FaCog } from "react-icons/fa";
import { AiOutlineWhatsApp, AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  getDocs,
  doc,
  updateDoc,onSnapshot,
  deleteDoc,setDoc,getDoc,orderBy,where,limit
} from "firebase/firestore";
import { db } from "../config/firebase";
import { getAuth } from "firebase/auth";
const Navbar = ({ handleMenuClick }) => {

  const [isFullScreen, setIsFullScreen] = useState(false); // Fullscreen toggle state
  const [currentDateTime, setCurrentDateTime] = useState(new Date().toLocaleString()); // Date & Time state
  // const [activeLink, setActiveLink] = useState(""); // Active link state
  const [activeLink, setActiveLink] = useState("Dashboard");
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const mails = [
    { id: 1, subject: "Welcome to the platform!", time: "5 mins ago" },
    { id: 2, subject: "System downtime notice", time: "1 hour ago" },
  ];
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

  const handleLinkClick = (link) => {
    setActiveLink(link);
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
  const [activeDropdown, setActiveDropdown] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [lastResetTime, setLastResetTime] = useState(
    () => localStorage.getItem("lastResetTime") || Date.now()
  );
//  const handleNavigate = () => {
//     if (notifications.length > 0) {
//       navigate("/orders2");
//       setTimeout(() => {
//         setNotifications([]);
//         setNotificationCount(0);
//         const resetTime = Date.now();
//         setLastResetTime(resetTime);
//         localStorage.setItem("lastResetTime", resetTime);
//       }, 100);
//     }
//   };
  // useEffect(() => {
  //   if (location.pathname === "/orders2") {
  //     setNotifications([]); 
  //     setNotificationCount(0); 
  //   }
  // }, [location.pathname]);
  
  // const updateNotifications = (newNotification) => {
  //   setNotifications((prevNotifications) => {
  //     // Ensure the notification is unique
  //     const newNotifications = [...prevNotifications];
  //     const exists = newNotifications.some(
  //       (notification) => notification.id === newNotification.id
  //     );
  //     if (!exists) {
  //       newNotifications.push(newNotification);
  //       playNotificationSound(); // Play sound when a new notification is added
  //     }
  
  //     // Set count based on the new array length
  //     setNotificationCount(newNotifications.length);
  //     return newNotifications;
  //   });
  // };
  
  // const playNotificationSound = () => {
  //   try {
  //     // Path to the notification sound in the public folder
  //     const notificationSound = new Audio("/notification.mp3.wav");
  //     notificationSound.play().catch((err) => {
  //       console.error("Error playing notification sound:", err);
  //     });
  //   } catch (error) {
  //     console.error("Error initializing notification sound:", error);
  //   }
  // };
  
  // useEffect(() => {
  //   const fetchAllOrders = async () => {
  //     const usersRef = collection(db, "users");
  //     const userEmails = (await getDocs(usersRef)).docs.map((doc) => doc.id);
  //     const unsubscribeFunctions = [];

  //     userEmails.forEach((email) => {
  //       const buynowRef = collection(db, `users/${email}/buynow order`);
  //       const cartRef = collection(db, `users/${email}/cart order`);

  //       // Listener for `buynow` orders
  //       const unsubscribeBuynow = onSnapshot(query(buynowRef), (snapshot) => {
  //         snapshot.docChanges().forEach((change) => {
  //           if (change.type === "added") {
  //             const newNotification = {
  //               ...change.doc.data(),
  //               id: change.doc.id,
  //               type: "Buy Now",
  //               userEmail: email,
  //             };
  //             updateNotifications(newNotification);
  //             playNotificationSound();
  //           }
  //         });
  //       });
  //       unsubscribeFunctions.push(unsubscribeBuynow);

  //       // Listener for `cart` orders
  //       const unsubscribeCart = onSnapshot(query(cartRef), (snapshot) => {
  //         snapshot.docChanges().forEach((change) => {
  //           if (change.type === "added") {
  //             const newNotification = {
  //               ...change.doc.data(),
  //               id: change.doc.id,
  //               type: "Cart",
  //               userEmail: email,
  //             };
  //             updateNotifications(newNotification);
  //             playNotificationSound();
  //           }
  //         });
  //       });
  //       unsubscribeFunctions.push(unsubscribeCart);
  //     });
  //     return () => {
  //       unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
  //     };
  //   };

  //   fetchAllOrders();
  // }, []);
  
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(""); 
      }
    };
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBellClick = () => {
    setActiveDropdown((prev) => (prev === "notifications" ? "" : "notifications"));
  };
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);

 const handleNotificationClick = (orderId) => {
  console.log("Notification clicked, highlightedOrderId:", orderId);
  setHighlightedOrderId(orderId);
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

      <div className="relative">
  <button
    className="p-3 rounded-full hover:bg-gray-700"
    onClick={handleBellClick}
  >
    <FaBell size={24} />
    {notificationCount > 0 && (
      <span className="absolute top-0 right-0 bg-red-600 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
        {notificationCount}
      </span>
    )}
  </button>
  {activeDropdown === "notifications" && (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white text-black rounded-lg shadow-lg z-50"
    >
      {/* <div className="p-4">
        <h3 className="font-semibold text-lg">Order Notifications</h3>
      </div>
      <div className="h-60 overflow-y-auto "onClick={handleNavigate}>
        
        <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center animate-bounce text-2xl">
              <span role="img" aria-label="box">
                📦
              </span>{" "}
              <p className="mt-2 font-semibold text-gray-700">No new orders here!</p>
            </div>
          </div>
      </div> */}
    </div>
  )}
</div>


         {/* whatapp*/}

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

        {/* Mail
        <div
          className="relative"
          onMouseEnter={() => setActiveDropdown("mail")}
          onMouseLeave={() => setActiveDropdown("")}
        >
          <button className="p-3 rounded-full hover:bg-gray-700">
            <AiOutlineMail size={24} />
            {mails.length > 0 && (
              <span className="absolute top-0 right-0 bg-green-500 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
                {mails.length}
              </span>
            )}
          </button>
          {activeDropdown === "mail" && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-lg shadow-lg z-50">
              <div className="p-4">
                <h3 className="font-semibold text-lg">Mails</h3>
              </div>
              <div className="h-60 overflow-y-auto">
                {mails.map((mail) => (
                  <div key={mail.id} className="p-4 border-b hover:bg-gray-200 cursor-pointer">
                    <p className="font-medium">{mail.subject}</p>
                    <span className="text-xs text-gray-500">{mail.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div> */}

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
      marginTop: "5px", // Fixed typo: "marginToptop" to "marginTop"
    }}
    className="flex items-center"
  >
    {/* Logout Icon */}
    <RiLogoutCircleRLine size={24} className="mr-2 hover:text-red-700 transition duration-200" />
    {/* Text */}
    <span className="p-3 rounded-full text-red-500"></span>
  </Link>
</li>
      </div>
    </nav>
  );
};

export default Navbar;
