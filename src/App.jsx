import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Categories
import AllCategories from './pages/Categories/AllCategories';
import AddCategory from './pages/Categories/AddCategory';
import EditCategory from './pages/Categories/EditCategory';

// Products
import AllProducts from './pages/Products/AllProducts';
import AddProduct from './pages/Products/AddProduct';
import EditProduct from './pages/Products/EditProduct';

// Orders
import AllOrders from './pages/Orders/AllOrders';
import OrderDetail from './pages/Orders/OrderDetail';
import ExchangeRequests from './pages/Orders/ExchangeRequests';

// Customers
import AllCustomers from './pages/Customers/AllCustomers';
import EditCustomer from './pages/Customers/EditCustomer';

// Staff (New)
import AllStaff from './pages/Staff/AllStaff';
import AddStaff from './pages/Staff/AddStaff';

// Banners
import AllBanners from './pages/Banners/AllBanners';
import AddBanner from './pages/Banners/AddBanner';
import EditBanner from './pages/Banners/EditBanner';


import AllCampaigns from './pages/Campaigns/AllCampaigns';
import AddEditCampaign from './pages/Campaigns/AddEditCampaign';

import AllReviews from './pages/Reviews/AllReviews';

import AllCoupons from './pages/Coupons/AllCoupons';
import AddCoupon from './pages/Coupons/AddCoupon';
import Settings from './pages/Settings/Settings';
import EditStaff from './pages/Staff/EditStaff';

import AllOccasions from './pages/marketing/AllOccasions';
import AllTestimonials from './pages/marketing/AllTestimonials';
import AddEditOccasion from './pages/marketing/AddEditOccasion';
import AddEditTestimonial from './pages/marketing/AddEditTestimonial';
import Popups from './pages/popups/Popups';
// Weekly Fruit Boxes
import WeeklyBoxList from './pages/WeeklyBoxes/WeeklyBoxList';
import AddEditWeeklyBox from './pages/WeeklyBoxes/AddEditWeeklyBox';
import IngredientsList from "./pages/Ingredients/IngredientsList";
import AddEditIngredient from "./pages/Ingredients/AddEditIngredient";
import ProductMapping from "./pages/Ingredients/ProductMapping";
import ManageOptions from "./pages/Ingredients/ManageOptions";
import CustomOptions from './pages/Ingredients/CustomOptions';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Category Routes */}
      <Route path="/categories" element={<AllCategories />} />
      <Route path="/categories/add" element={<AddCategory />} />
      <Route path="/categories/edit/:id" element={<EditCategory />} />

      {/* Product Routes */}
      <Route path="/products" element={<AllProducts />} />
      <Route path="/products/add" element={<AddProduct />} />
      <Route path="/products/edit/:id" element={<EditProduct />} />

      {/* Order Routes */}
      <Route path="/orders" element={<AllOrders />} />
      <Route path="/orders/:id" element={<OrderDetail />} />

      {/* Customer Routes */}
      <Route path="/customers" element={<AllCustomers />} />
      <Route path="/customers/edit/:id" element={<EditCustomer />} />

      {/* Staff / Team Routes */}
      <Route path="/staff" element={<AllStaff />} />
      <Route path="/staff/add" element={<AddStaff />} />
      <Route path="/staff/edit/:id" element={<EditStaff />} />

      {/* Banner Routes */}
      <Route path="/banners" element={<AllBanners />} />
      <Route path="/banners/add" element={<AddBanner />} />



      {/* Review Routes */}
      <Route path="/reviews" element={<AllReviews />} />

      <Route path="/coupons" element={<AllCoupons />} />
      <Route path="/coupons/add" element={<AddCoupon />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/banners/edit/:id" element={<EditBanner />} />
      {/* Campaign Routes */}
      <Route path="/campaigns" element={<AllCampaigns />} />
      <Route path="/campaigns/add" element={<AddEditCampaign />} />
      <Route path="/campaigns/edit/:id" element={<AddEditCampaign />} />
      {/* Weekly Fruit Box Routes */}
      {/* Weekly Boxes Routes */}
      <Route path="/weekly-boxes" element={<WeeklyBoxList />} />
      <Route path="/weekly-boxes/new" element={<AddEditWeeklyBox />} />
      <Route path="/weekly-boxes/edit/:id" element={<AddEditWeeklyBox />} />
      {/* Marketing Routes */}
      <Route path="/marketing/occasions" element={<AllOccasions />} />
      <Route path="/marketing/testimonials" element={<AllTestimonials />} />
      <Route path="/marketing/occasions/add" element={<AddEditOccasion />} />
      <Route path="/marketing/occasions/edit/:id" element={<AddEditOccasion />} />
      <Route path="/marketing/testimonials/add" element={<AddEditTestimonial />} />
      <Route path="/marketing/testimonials/edit/:id" element={<AddEditTestimonial />} />
      <Route path="/exchanges" element={<ExchangeRequests />} />
      <Route path='/popups' element={<Popups />} />

      <Route path="/ingredients" element={<IngredientsList />} />
      <Route path="/ingredients/add" element={<AddEditIngredient />} />
      <Route path="/ingredients/edit/:id" element={<AddEditIngredient />} />
      <Route path="/mapping" element={<ProductMapping />} />
    // Sidebar ke paths ke hisaab se routes
      <Route path="/custom-options" element={<CustomOptions />} />
      <Route path="/options/add" element={<ManageOptions />} />
      <Route path="/options/edit/:id" element={<ManageOptions />} />
    </Routes>
  );
}

export default App;