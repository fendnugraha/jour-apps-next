import DailyDashboard from "./components/DailyDashboard";
import { useAuth } from "@/libs/auth";
import MainPage from "../main";

const Dashboard = () => {
    return <MainPage headerTitle="Dashboard">{/* <DailyDashboard warehouse={warehouse} warehouses={warehouses} userRole={userRole} /> */}</MainPage>;
};

export default Dashboard;
