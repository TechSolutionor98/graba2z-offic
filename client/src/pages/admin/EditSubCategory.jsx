import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ImageUpload from "../../components/ImageUpload";
import TipTapEditor from "../../components/TipTapEditor";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import config from "../../config/config";

const EditSubCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    seoContent: "",
    metaTitle: "",
    metaDescription: "",
    redirectUrl: "",
    image: "",
    category: "",
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchSubCategory();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${config.API_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (error) {
      showToast("Failed to load categories", "error");
    }
  };

  const fetchSubCategory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${config.API_URL}/api/subcategories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const subCategoryData = response.data;
      
      setFormData({
        name: subCategoryData.name || "",
        description: subCategoryData.description || "",
        seoContent: subCategoryData.seoContent || "",
        metaTitle: subCategoryData.metaTitle || "",
        metaDescription: subCategoryData.metaDescription || "",
        redirectUrl: subCategoryData.redirectUrl || "",
        image: subCategoryData.image || "",
        category: subCategoryData.category?._id || subCategoryData.category || "",
        isActive: subCategoryData.isActive !== undefined ? subCategoryData.isActive : true,
        sortOrder: subCategoryData.sortOrder || 0,
      });
    } catch (error) {
      showToast("Failed to load subcategory", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (imageUrl) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }));
  };

  const handleSeoContentChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      seoContent: content,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(`${config.API_URL}/api/subcategories/${id}`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      showToast("Subcategory updated successfully!", "success");
      navigate("/admin/subcategories");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update subcategory", "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <button
                onClick={() => navigate("/admin/subcategories")}
                className="hover:text-blue-600 flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Sub Categories
              </button>
              <span>/</span>
              <span className="text-gray-900">Edit Sub Category</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Sub Category</h1>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter subcategory name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Parent Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter sort order..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subcategory description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SEO Content</label>
                <TipTapEditor
                  content={formData.seoContent}
                  onChange={handleSeoContentChange}
                  placeholder="Enter detailed SEO content for this subcategory..."
                />
                <p className="text-sm text-gray-500 mt-1">This content will be displayed on the subcategory page for SEO purposes.</p>
              </div>

              {/* Meta Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                  <span className="text-gray-500 text-xs ml-2">(50-60 characters recommended)</span>
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  maxLength={60}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Best Laser Printers in UAE | Grabatoz"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-sm text-gray-500">
                    SEO title that appears in search engine results
                  </p>
                  <span className="text-xs text-gray-400">
                    {formData.metaTitle.length}/60
                  </span>
                </div>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                  <span className="text-gray-500 text-xs ml-2">(150-160 characters recommended)</span>
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows={3}
                  maxLength={160}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Discover high-quality laser printers for home and office. Fast printing, energy efficient. Free UAE delivery."
                />
                <div className="flex justify-between mt-1">
                  <p className="text-sm text-gray-500">
                    Description that appears below the title in search results
                  </p>
                  <span className="text-xs text-gray-400">
                    {formData.metaDescription.length}/160
                  </span>
                </div>
              </div>

              {/* Redirect URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Redirect URL
                  <span className="text-gray-500 text-xs ml-2">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="redirectUrl"
                  value={formData.redirectUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., /shop/new-subcategory-name or https://example.com/page"
                />
                <p className="text-sm text-gray-500 mt-1">
                  If set, visitors will be redirected to this URL when accessing this subcategory
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category Image</label>
                <ImageUpload onImageUpload={handleImageUpload} currentImage={formData.image} />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Active Sub Category</label>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/admin/subcategories")}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSubCategory;