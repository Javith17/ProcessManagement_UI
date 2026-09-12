import './App.css';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import DefaultLayout from './layouts/DefaultLayout';
import ProtectedLayout from './layouts/ProtectedLayout';
import SidebarNav from './pages/SidebarNav';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import Suppliers from './pages/Suppliers';
import Process from './pages/Process';
import Customers from './pages/Customers';
import Parts from './pages/Parts';
import BoughtOuts from './pages/BoughtOuts';
import NewVendor from './pages/NewVendor';
import NewSupplier from './pages/NewSupplier';
import NewCustomer from './pages/NewCustomer';
import NewPart from './pages/NewPart';
import NewBoughtout from './pages/NewBoughtout';
import Machines from './pages/Machines';
import NewMachine from './pages/NewMachine';
import SubAssembly from './pages/SubAssembly';
import Quotations from './pages/Quotations';
import NewSubAssembly from './pages/NewSubAssembly';
import NewMainAssembly from './pages/NewMainAssembly';
import NewSectionAssembly from './pages/NewSectionAssembly';
import EditSubAssembly from './pages/EditSubAssembly';
import EditMainAssembly from './pages/EditMainAssembly';
import EditSectionAssembly from './pages/EditSectionAssembly';
import EditPart from './pages/EditPart';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import EditBoughtout from './pages/EditBoughtout';
import VendorAcceptance from './pages/VendorAcceptance';
import SupplierAcceptance from './pages/SupplierAcceptance';
import Stores from './pages/Stores';
import Assembly from './pages/Assembly';
import NewDashboard from './pages/NewDashboard';
import Enquiry from './pages/Enquiry';
import Attendance from './pages/Attendance';
import LeaveRequest from './pages/LeaveRequest';

import V2ThemeWrapper from './v2/V2ThemeWrapper';
import V2DefaultLayout from './v2/V2DefaultLayout';
import V2ProtectedLayout from './v2/V2ProtectedLayout';
import V2Login from './v2/pages/V2Login';
import V2Dashboard from './v2/pages/V2Dashboard';
import V2Users from './v2/pages/V2Users';
import V2Roles from './v2/pages/V2Roles';
import V2Vendors from './v2/pages/V2Vendors';
import V2Suppliers from './v2/pages/V2Suppliers';
import V2Stores from './v2/pages/V2Stores';
import V2Attendance from './v2/pages/V2Attendance';
import V2LeaveRequest from './v2/pages/V2LeaveRequest';
import V2Customers from './v2/pages/V2Customers';
import V2Process from './v2/pages/V2Process';
import V2Parts from './v2/pages/V2Parts';
import V2BoughtOuts from './v2/pages/V2BoughtOuts';
import V2NewVendor from './v2/pages/V2NewVendor';
import V2NewSupplier from './v2/pages/V2NewSupplier';
import V2NewCustomer from './v2/pages/V2NewCustomer';
import V2NewPart from './v2/pages/V2NewPart';
import V2EditPart from './v2/pages/V2EditPart';
import V2NewBoughtout from './v2/pages/V2NewBoughtout';
import V2EditBoughtout from './v2/pages/V2EditBoughtout';
import V2Machines from './v2/pages/V2Machines';
import V2NewMachine from './v2/pages/V2NewMachine';
import V2SubAssembly from './v2/pages/V2SubAssembly';
import V2NewSubAssembly from './v2/pages/V2NewSubAssembly';
import V2EditSubAssembly from './v2/pages/V2EditSubAssembly';
import V2NewMainAssembly from './v2/pages/V2NewMainAssembly';
import V2EditMainAssembly from './v2/pages/V2EditMainAssembly';
import V2NewSectionAssembly from './v2/pages/V2NewSectionAssembly';
import V2EditSectionAssembly from './v2/pages/V2EditSectionAssembly';
import V2Quotations from './v2/pages/V2Quotations';
import V2Assembly from './v2/pages/V2Assembly';
import V2Orders from './v2/pages/V2Orders';
import V2OrderDetail from './v2/pages/V2OrderDetail';
import V2Enquiry from './v2/pages/V2Enquiry';
import V2VendorAcceptance from './v2/pages/V2VendorAcceptance';
import V2SupplierAcceptance from './v2/pages/V2SupplierAcceptance';

function App() {
  return (
    <>
      <Routes>
        <Route path="/vendorAccept" element={<VendorAcceptance />} />
        <Route path="/supplierAccept" element={<SupplierAcceptance />} />
        <Route element={<DefaultLayout />}>
          <Route path="/login" element={<Login />} />
         </Route>
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<NewDashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leave-request" element={<LeaveRequest />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/process" element={<Process />} />
          <Route path="/parts" element={<Parts />} />
          <Route path="/boughtout" element={<BoughtOuts />} />
          <Route path="/vendors/newVendor" element={<NewVendor />} />
          <Route path="/suppliers/newSupplier" element={<NewSupplier />} />
          <Route path="/customers/newCustomer" element={<NewCustomer />} />
          <Route path="/parts/newPart" element={<NewPart />} />
          <Route path="/parts/editPart" element={<EditPart />} />
          <Route path="/boughtout/newBoughtout" element={<NewBoughtout />} />
          <Route path="/boughtout/editBoughtout" element={<EditBoughtout />} />
          <Route path="/machines" element={<Machines />} />
          <Route path="/machines/newMachine" element={<NewMachine />} />
          <Route path="/subAssembly" element={<SubAssembly />} />
          <Route path="/subAssembly/newSubAssembly" element={<NewSubAssembly />} />
          <Route path="/subAssembly/editSubAssembly" element={<EditSubAssembly />} />
          <Route path="/subAssembly/newMainAssembly" element={<NewMainAssembly />} />
          <Route path="/subAssembly/editMainAssembly" element={<EditMainAssembly />} />
          <Route path="/subAssembly/newSectionAssembly" element={<NewSectionAssembly />} />
          <Route path="/subAssembly/editSectionAssembly" element={<EditSectionAssembly />} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/assembly" element={<Assembly />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orderDetail" element={<OrderDetail />} />
          <Route path="/enquiries" element={<Enquiry />} />
        </Route>

        {/* ===== v2 design concept — additive only, mirrors every route above under /v2 ===== */}
        <Route path="/v2" element={<V2ThemeWrapper />}>
          <Route path="vendorAccept" element={<V2VendorAcceptance />} />
          <Route path="supplierAccept" element={<V2SupplierAcceptance />} />
          <Route element={<V2DefaultLayout />}>
            <Route path="login" element={<V2Login />} />
          </Route>
          <Route element={<V2ProtectedLayout />}>
            <Route index element={<V2Dashboard />} />
            <Route path="users" element={<V2Users />} />
            <Route path="roles" element={<V2Roles />} />
            <Route path="vendors" element={<V2Vendors />} />
            <Route path="suppliers" element={<V2Suppliers />} />
            <Route path="stores" element={<V2Stores />} />
            <Route path="attendance" element={<V2Attendance />} />
            <Route path="leave-request" element={<V2LeaveRequest />} />
            <Route path="customers" element={<V2Customers />} />
            <Route path="process" element={<V2Process />} />
            <Route path="parts" element={<V2Parts />} />
            <Route path="boughtout" element={<V2BoughtOuts />} />
            <Route path="vendors/newVendor" element={<V2NewVendor />} />
            <Route path="suppliers/newSupplier" element={<V2NewSupplier />} />
            <Route path="customers/newCustomer" element={<V2NewCustomer />} />
            <Route path="parts/newPart" element={<V2NewPart />} />
            <Route path="parts/editPart" element={<V2EditPart />} />
            <Route path="boughtout/newBoughtout" element={<V2NewBoughtout />} />
            <Route path="boughtout/editBoughtout" element={<V2EditBoughtout />} />
            <Route path="machines" element={<V2Machines />} />
            <Route path="machines/newMachine" element={<V2NewMachine />} />
            <Route path="subAssembly" element={<V2SubAssembly />} />
            <Route path="subAssembly/newSubAssembly" element={<V2NewSubAssembly />} />
            <Route path="subAssembly/editSubAssembly" element={<V2EditSubAssembly />} />
            <Route path="subAssembly/newMainAssembly" element={<V2NewMainAssembly />} />
            <Route path="subAssembly/editMainAssembly" element={<V2EditMainAssembly />} />
            <Route path="subAssembly/newSectionAssembly" element={<V2NewSectionAssembly />} />
            <Route path="subAssembly/editSectionAssembly" element={<V2EditSectionAssembly />} />
            <Route path="quotations" element={<V2Quotations />} />
            <Route path="assembly" element={<V2Assembly />} />
            <Route path="orders" element={<V2Orders />} />
            <Route path="orderDetail" element={<V2OrderDetail />} />
            <Route path="enquiries" element={<V2Enquiry />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
