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

function App() {
  return (
    <>
      <Routes>
        <Route path="/vendorAccept" element={<VendorAcceptance />} />
        <Route element={<DefaultLayout />}>
          <Route path="/login" element={<Login />} />
         </Route>
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/suppliers" element={<Suppliers />} />
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
          <Route path="/orders" element={<Orders />} />
          <Route path="/orderDetail" element={<OrderDetail />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
