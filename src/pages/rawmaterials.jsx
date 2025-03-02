import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { FaChartLine } from "react-icons/fa";
import { auth, db } from "../config/firebase";
import Swal from "sweetalert2";

const RawMaterialsStock = () => {
  const [showModal, setShowModal] = useState(false);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMaterial, setNewMaterial] = useState({
    no: "",
    name: "",
    categories: "",
    estock: "",
    cstock: "",
    price: "",
    usageQuantity: 0, // Added usage quantity for manual entry
  });

  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login");
  }, [user, loading, navigate]);

  // Fetch raw materials from the Firestore RawMaterials collection under the admin's document
  useEffect(() => {
    const fetchRawMaterials = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, "admins", user.email); // Admin's document reference
        const materialsRef = collection(userDocRef, "RawMaterials"); // RawMaterials collection
        const materialSnapshot = await getDocs(materialsRef);

        const materialList = materialSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRawMaterials(materialList);
      } catch (error) {
        console.error("Error fetching raw materials:", error);
      }
    };

    fetchRawMaterials();
  }, [user]);

  // Function to automatically update raw materials daily based on cstock
  const updateDailyStock = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "admins", user.email);
      const materialsRef = collection(userDocRef, "RawMaterials");

      // Loop through each raw material and update stock
      for (const material of rawMaterials) {
        const materialDocRef = doc(materialsRef, material.no);
        const updatedEstock = material.estock - material.usageQuantity; // Deduct current stock from existing stock

        // Prevent negative stock
        if (updatedEstock < 0) {
          Swal.fire({
            icon: "warning",
            title: "Insufficient Stock",
            text: `Not enough stock for ${material.name}. Current stock can't be reduced below zero.`,
          });
          continue;
        }

        // Update stock and reset current stock (cstock) to 0
        await updateDoc(materialDocRef, {
          estock: updatedEstock,
          cstock: material.cstock + material.usageQuantity, // Update cstock
        });

        console.log(`Updated ${material.name}: Estock is now ${updatedEstock}`);
      }

      Swal.fire("Success", "Raw materials stock updated automatically!", "success");
    } catch (error) {
      console.error("Error updating raw materials:", error);
      Swal.fire("Error", "Failed to update raw materials.", "error");
    }
  };

  // Handle form input changes for adding/updating raw materials
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMaterial((prev) => ({ ...prev, [name]: value }));
  };

  // Handle usage quantity entry
  const handleUsageQuantityChange = (e) => {
    const usageQuantity = parseInt(e.target.value) || 0;
    setNewMaterial((prev) => ({
      ...prev,
      usageQuantity,
    }));
  };

  // Submit form for adding or updating raw material
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const userDocRef = doc(db, "admins", user.email);
      const materialsRef = collection(userDocRef, "RawMaterials");

      // Auto-generate Material No if not set
      if (!newMaterial.no) {
        newMaterial.no = Date.now().toString(); // Unique ID based on timestamp
      }

      // Validate if the usage quantity is greater than the existing stock
      if (newMaterial.usageQuantity > newMaterial.estock) {
        Swal.fire({
          icon: "error",
          title: "Invalid Usage Quantity",
          text: "Usage quantity cannot be greater than the existing stock.",
        });
        return;
      }

      const materialDocRef = doc(materialsRef, newMaterial.no);

      // Adjust existing stock based on usage quantity and update current stock (cstock)
      const updatedEstock = newMaterial.estock - newMaterial.usageQuantity;
      const updatedCstock = newMaterial.cstock + newMaterial.usageQuantity;

      await setDoc(
        materialDocRef,
        {
          ...newMaterial,
          estock: updatedEstock,
          cstock: updatedCstock, // Update current stock
        },
        { merge: true }
      );

      setRawMaterials((prev) => {
        const updatedMaterials = prev.filter((mat) => mat.no !== newMaterial.no);
        return [...updatedMaterials, newMaterial];
      });

      Swal.fire(
        "Success",
        newMaterial.no ? "Raw material updated successfully!" : "Raw material added successfully!",
        "success"
      );

      setShowModal(false);
      setNewMaterial({
        no: "",
        name: "",
        categories: "",
        estock: "",
        cstock: "",
        price: "",
        usageQuantity: 0, // Reset usage quantity
      });
    } catch (error) {
      console.error("Error adding/updating raw material:", error);
      Swal.fire("Error", "Failed to add/update raw material.", "error");
    }
  };

  // Remove material from raw materials collection
  const handleRemoveMaterial = async (no) => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Not Logged In",
        text: "Please log in to delete a raw material.",
        confirmButtonText: "Okay",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      const userDocRef = doc(db, "admins", user.email);
      const materialRef = doc(userDocRef, "RawMaterials", no);

      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
      });

      if (result.isConfirmed) {
        await deleteDoc(materialRef);
        setRawMaterials(rawMaterials.filter((material) => material.no !== no));
        Swal.fire("Deleted!", "Raw material has been deleted.", "success");
      }
    } catch (error) {
      console.error("Error deleting raw material:", error);
      Swal.fire("Error", "Failed to delete raw material.", "error");
    }
  };

  // Filter logic for searching raw materials
  const filteredRawMaterials = rawMaterials.filter((material) => {
    const { name, categories, estock, cstock, price } = material;
    const query = searchQuery.toLowerCase();

    return (
      (name && name.toLowerCase().includes(query)) ||
      (categories && categories.toLowerCase().includes(query)) ||
      (estock && estock.toString().toLowerCase().includes(query)) ||
      (cstock && cstock.toString().toLowerCase().includes(query)) ||
      (price && price.toString().toLowerCase().includes(query))
    );
  });

  // Info Box Calculations
  const totalMaterials = filteredRawMaterials.length;
  const totalStock = filteredRawMaterials.reduce(
    (acc, material) => acc + parseInt(material.estock),
    0
  );
  const totalPrice = filteredRawMaterials
    .reduce(
      (acc, material) =>
        acc + parseFloat(material.price) * parseInt(material.estock),
      0
    )
    .toFixed(2);

  return (
    <div className="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 bg-gradient-to-br from-blue-100 to-indigo-100 min-h-screen w-full">
      <h1 className="text-5xl font-extrabold text-blue-900 mb-6 flex items-center">
        Raw Materials Stock Management{" "}
        <FaChartLine className="text-5xl ml-5 text-blue-900 animate-neon" />
      </h1>

      {/* Info Boxes */}
      <div className="mb-6 grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-green-900 p-4 rounded-md shadow-md border-l-4 border-green-400">
          <h3 className="text-lg font-semibold text-gray-100">Total Materials</h3>
          <p className="text-3xl font-bold text-gray-100">{totalMaterials}</p>
        </div>
        <div className="bg-red-900 p-4 rounded-md shadow-md border-l-4 border-red-400">
          <h3 className="text-lg font-semibold text-gray-100">Total Stock</h3>
          <p className="text-3xl font-bold text-gray-100">{totalStock}</p>
        </div>
        <div className="bg-blue-900 p-4 rounded-md shadow-md border-l-4 border-blue-400">
          <h3 className="text-lg font-semibold text-gray-100">Total Price</h3>
          <p className="text-3xl font-bold text-gray-100">₹{totalPrice}</p>
        </div>
      </div>

      {/* Button to trigger daily stock update */}
      <div className="mb-6">
        <button
          onClick={updateDailyStock}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Update Raw Materials Automatically
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex justify-between items-center">
        <input
          type="text"
          className="px-4 py-2 rounded-md border"
          placeholder="Search Raw Materials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Add Raw Material
        </button>
      </div>

      {/* Raw Materials Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="py-3 px-4 text-left">M.No</th>
              <th className="py-3 px-4 text-left">Material Name</th>
              <th className="py-3 px-4 text-left">Existing Stock</th>
              <th className="py-3 px-4 text-left">Current Stock</th>
              <th className="py-3 px-4 text-left">Price</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRawMaterials.map((material) => {
              return (
                <tr key={material.no} className="border-b">
                  <td className="py-3 px-4">{material.no}</td>
                  <td className="py-3 px-4">{material.name}</td>
                  <td className="py-3 px-4">{material.estock}</td>
                  <td className="py-3 px-4">{material.cstock}</td>
                  <td className="py-3 px-4">₹{material.price}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        setShowModal(true);
                        setNewMaterial(material);
                      }}
                      className="text-yellow-600 mr-2"
                    >
                      <AiOutlineEdit size={24} />
                    </button>
                    <button
                      onClick={() => handleRemoveMaterial(material.no)}
                      className="text-red-600"
                    >
                      <AiOutlineDelete size={24} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add/Update Material Modal */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-2xl font-semibold mb-4">Add/Update Material</h2>
            <form onSubmit={handleFormSubmit}>
              {/* Material No */}
              <input
                className="w-full px-3 py-2 mb-4 rounded-md border"
                type="text"
                name="no"
                placeholder="Material No"
                value={newMaterial.no}
                disabled
              />
              {/* Material Name */}
              <input
                className="w-full px-3 py-2 mb-4 rounded-md border"
                type="text"
                name="name"
                placeholder="Material Name"
                value={newMaterial.name}
                onChange={handleInputChange}
              />
              {/* Categories */}
              <input
                className="w-full px-3 py-2 mb-4 rounded-md border"
                type="text"
                name="categories"
                placeholder="Categories"
                value={newMaterial.categories}
                onChange={handleInputChange}
              />
              {/* Estock */}
              <input
                className="w-full px-3 py-2 mb-4 rounded-md border"
                type="number"
                name="estock"
                placeholder="Estock"
                value={newMaterial.estock}
                onChange={handleInputChange}
              />
              {/* Usage Quantity */}
              <input
                className="w-full px-3 py-2 mb-4 rounded-md border"
                type="number"
                name="usageQuantity"
                placeholder="Usage Quantity"
                value={newMaterial.usageQuantity}
                onChange={handleUsageQuantityChange}
              />
              {/* Current Stock */}
              <input
                className="w-full px-3 py-2 mb-4 rounded-md border"
                type="number"
                name="cstock"
                placeholder="Current Stock"
                value={newMaterial.cstock}
                disabled
              />
              {/* Price */}
              <input
                className="w-full px-3 py-2 mb-4 rounded-md border"
                type="number"
                name="price"
                placeholder="Price"
                value={newMaterial.price}
                onChange={handleInputChange}
              />
              {/* Submit Button */}
              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  {newMaterial.no ? "Update Material" : "Add Material"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-600 ml-4"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RawMaterialsStock;
