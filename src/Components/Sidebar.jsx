import { useState,useEffect } from "react";
import { Link ,useNavigate} from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth"; // Import Firebase auth
import { toast } from "react-toastify";
const Sidebar = ({ sidebarVisible, toggleSidebar }) => {
  const [activeLink, setActiveLink] = useState("Dashboard");

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
  
  const [userEmail, setUserEmail] = useState(null); // Store logged-in user email
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email); // Set email when user is logged in
      } else {
        setUserEmail(null); // Reset on logout
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

 
  return (
    <section id="sidebar" className={sidebarVisible ? "" : "hide print:hidden"}>
      <div className="sidebar-header p-8 bg-gradient-to-r from-blue-800 to-indigo-800">
        {/* Logo Section */}
        <a href="#" className="brand flex items-center text-white">
          <img
            src="../src/assets/logo.png" // Replace with the correct path to your logo
            alt="SVS Traders Logo"
            className="w-13 h-13 object-contain" // Increased size of the logo
          />
          <span className="text-3xl font-bold ml-4 print:hidden"></span>{" "}
          {/* Larger text for logo */}
        </a>
      </div>
      <ul className="side-menu print:hidden space-y-4">
        {/* Conditional Rendering for madhu@gmail.com */}
        {userEmail === "madhu@gmail.com" ? (
          <>
              <li className="flex justify-between items-center p-4 hover:bg-indigo-200 rounded-lg transition-all duration-300">
          <Link to="/Stock" onClick={() => handleLinkClick("Stock")}>
            <i className="bx bxs-package text-xl"></i>
            <span className="text-lg ml-2">Stock</span>
          </Link>
        </li>
    
          {/* EndProduct Menu */}
          <li className="flex justify-between items-center p-4 hover:bg-indigo-200 rounded-lg transition-all duration-300">
          <Link to="/endproduct" onClick={() => handleLinkClick("EndProduct")}>
            <i className="bx bxs-cube text-xl"></i>
            <span className="text-lg ml-2">End Product</span>
          </Link>
        </li>
          
            <li className="flex justify-between items-center p-4 hover:bg-indigo-200 rounded-lg transition-all duration-300">
              <Link to="/attendence" onClick={() => setActiveLink("attendence")}>
                <i className="bx bxs-check-circle text-xl"></i>
                <span className="text-lg ml-2">Attendance</span>
              </Link>
            </li>
          </>
        ) : (
          <>
     
        {/* Inventory Menu */}
        <li className="flex justify-between items-center p-4 hover:bg-indigo-200 rounded-lg transition-all duration-300">
          <Link to="/purchase" onClick={() => handleLinkClick("purchase")}>
            <i className="bx bxs-cart text-xl"></i>
            <span className="text-lg ml-2">Purchase</span>
          </Link>
        </li>

        <li className="flex justify-between items-center p-4 hover:bg-indigo-200 rounded-lg transition-all duration-300">
          <Link to="/Stock" onClick={() => handleLinkClick("Stock")}>
            <i className="bx bxs-package text-xl"></i>
            <span className="text-lg ml-2">Stock</span>
          </Link>
        </li>

        {/* Raw Materials Stock Menu */}
        <li className="flex justify-between items-center p-4 hover:bg-indigo-200 rounded-lg transition-all duration-300">
          <Link
            to="/rawmaterials"
            onClick={() => handleLinkClick("rawmaterials")}
          >
            <i className="bx bxs-cube text-xl"></i>
            <span className="text-lg ml-2">Raw Materials Stock</span>
          </Link>
        </li>

        <li className="flex justify-between items-center p-4 hover:bg-indigo-200 rounded-lg transition-all duration-300">
          <Link to="/sales" onClick={() => handleLinkClick("sales")}>
            <i className="bx bxs-cart-alt text-xl"></i>
            <span className="text-lg ml-2">Sales</span>
          </Link>
        </li>

        {/* EndProduct Menu */}
        <li className="flex justify-between items-center p-4 hover:bg-indigo-200 rounded-lg transition-all duration-300">
          <Link to="/endproduct" onClick={() => handleLinkClick("EndProduct")}>
            <i className="bx bxs-cube text-xl"></i>
            <span className="text-lg ml-2">End Product</span>
          </Link>
        </li>

        {/* Invoice Menu */}
        <li className="flex justify-between items-center p-4 hover:bg-indigo-200 rounded-lg transition-all duration-300">
          <Link to="/invoice" onClick={() => handleLinkClick("invoice")}>
            <i className="bx bxs-file text-xl"></i>
            <span className="text-lg ml-2">Invoice Page</span>
          </Link>
        </li>
        <li className="flex justify-between items-center p-4 hover:bg-indigo-200 rounded-lg transition-all duration-300">
          <Link
            to="/viewAllInvoice"
            onClick={() => handleLinkClick("viewAllInvoices")}
          >
            <i className="bx bxs-folder text-xl"></i>
            <span className="text-lg ml-2">View All Invoices</span>
          </Link>
        </li>

        <li className="flex justify-between items-center p-4 hover:bg-indigo-200 rounded-lg transition-all duration-300">
          <Link
            to="/CustomerDetails"
            onClick={() => handleLinkClick("CustomerDetails")}
          >
            <i className="bx bxs-user text-xl"></i>
            <span className="text-lg ml-2">Customer-Details</span>
          </Link>
        </li>
        <li className="flex justify-between items-center p-4 hover:bg-indigo-200 rounded-lg transition-all duration-300">
          <Link
            to="/BusinessDetails"
            onClick={() => handleLinkClick("BusinessDetails")}
          >
            <i className="bx bxs-briefcase text-xl"></i>
            <span className="text-lg ml-2">Business Details</span>
          </Link>
        </li>

        {/* HRM Section */}
        <li className="flex justify-between items-center p-4 hover:bg-indigo-200 rounded-lg transition-all duration-300">
          <Link to="/employee" onClick={() => handleLinkClick("employee")}>
            <i className="bx bxs-user text-xl"></i>
            <span className="text-lg ml-2">Employee Details</span>
          </Link>
        </li>
        <li className="flex justify-between items-center p-4 hover:bg-indigo-200 rounded-lg transition-all duration-300">
          <Link to="/attendence" onClick={() => handleLinkClick("attendence")}>
            <i className="bx bxs-check-circle text-xl"></i>
            <span className="text-lg ml-2">Attendance</span>
          </Link>
        </li>
        <li className="flex justify-between items-center p-4 hover:bg-indigo-200 rounded-lg transition-all duration-300">
          <Link to="/salary2" onClick={() => handleLinkClick("salary2")}>
            <i className="bx bxs-wallet text-xl"></i>
            <span className="text-lg ml-2">Salary</span>
          </Link>
        </li>

        {/* Reports */}
        <li className="flex justify-between items-center p-4 hover:bg-indigo-200 rounded-lg transition-all duration-300">
          <Link to="/report" onClick={() => handleLinkClick("report")}>
            <i className="bx bxs-report text-2xl"></i>
            <span className="ml-2 font-extrabold text-yellow-100 text-lg">
              Reports
            </span>
          </Link>
        </li>
        </>
        )}
      </ul>
    </section>
  );
};

export default Sidebar;
